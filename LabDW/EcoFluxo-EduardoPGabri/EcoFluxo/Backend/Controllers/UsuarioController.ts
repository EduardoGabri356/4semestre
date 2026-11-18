import { randomInt } from "node:crypto";
import type { Request, Response } from "express";
import { verify } from "@node-rs/argon2";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { NOME_COOKIE, opcoesCookie } from "../lib/cookies.js";
import { JWT_SECRET } from "../Middlewares/seguranca.js";
import { send2FACodeEmail } from "../Services/emailServices.js";

const VALIDADE_CODIGO_MS = 10 * 60 * 1000; //10 minutos
const VALIDADE_TOKEN_MS = 60 * 60 * 1000; //1 hora
const MAX_TENTATIVAS_CODIGO = 5;

//erros de código por usuário (em memória). Passando do limite, o código é invalidado
//e o usuário precisa fazer login de novo, o que impede adivinhar o código de 6 dígitos por força bruta.
const tentativasCodigo = new Map<number, number>();

const naoImplementado = (res: Response) =>
    res.status(501).json({ message: "Funcionalidade ainda não implementada" });

export default class UsuarioController {
    static async Create(req: Request, res: Response) {
        //TODO: validar dados obrigatórios, gerar o hash da senha (argon2) e inserir no banco
        return naoImplementado(res);
    }

    //primeira etapa do login: valida email/senha e envia o código de 2FA por e-mail
    static async Login(req: Request, res: Response) {
        const { email, senha } = req.body ?? {};
        if (typeof email !== "string" || typeof senha !== "string" || !email.trim() || !senha) {
            return res.status(400).json({ message: "E-mail e senha são obrigatórios" });
        }
        try {
            const usuario = await prisma.usuario.findUnique({ where: { email: email.trim() } });
            //mesma mensagem para e-mail inexistente e senha errada (não revela quais e-mails existem)
            if (!usuario || !(await verify(usuario.senha, senha))) {
                return res.status(401).json({ message: "Verifique as credenciais" });
            }

            const codigo = randomInt(100000, 1000000).toString();
            await prisma.usuario.update({
                where: { id: usuario.id },
                data: {
                    loginCode: codigo,
                    loginCodeExpires: new Date(Date.now() + VALIDADE_CODIGO_MS),
                },
            });
            tentativasCodigo.delete(usuario.id);

            await send2FACodeEmail(usuario.email, codigo);
            return res.status(200).json({
                require2FA: true,
                message: "Código de verificação enviado para o seu e-mail",
                email: usuario.email,
            });
        } catch (error) {
            console.error("Erro no login:", error);
            return res.status(500).json({ message: "Não foi possível concluir o login. Tente novamente." });
        }
    }

    //segunda etapa do login: confirma o código de 2FA e emite o token de acesso
    static async Verify2FA(req: Request, res: Response) {
        const { email, codigo } = req.body ?? {};
        if (typeof email !== "string" || typeof codigo !== "string" || !email.trim() || !codigo) {
            return res.status(400).json({ message: "E-mail e código são obrigatórios." });
        }

        try {
            const usuario = await prisma.usuario.findUnique({ where: { email: email.trim() } });
            if (!usuario || !usuario.loginCode || !usuario.loginCodeExpires) {
                return res.status(400).json({ message: "Código inválido ou não solicitado." });
            }
            if (new Date() > usuario.loginCodeExpires) {
                return res.status(400).json({ message: "O código de verificação expirou. Faça login novamente." });
            }

            if (usuario.loginCode !== codigo.trim()) {
                const erros = (tentativasCodigo.get(usuario.id) ?? 0) + 1;
                if (erros >= MAX_TENTATIVAS_CODIGO) {
                    tentativasCodigo.delete(usuario.id);
                    await prisma.usuario.update({
                        where: { id: usuario.id },
                        data: { loginCode: null, loginCodeExpires: null },
                    });
                    return res.status(429).json({ message: "Muitas tentativas incorretas. Faça login novamente para receber um novo código." });
                }
                tentativasCodigo.set(usuario.id, erros);
                return res.status(400).json({ message: "Código de verificação incorreto." });
            }

            //código válido: apaga para que não seja reutilizado
            tentativasCodigo.delete(usuario.id);
            await prisma.usuario.update({
                where: { id: usuario.id },
                data: { loginCode: null, loginCodeExpires: null },
            });

            //campos alinhados com UsuarioPayload (Middlewares/seguranca.ts)
            const dadosUsuario = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
            };
            const token = jwt.sign(dadosUsuario, JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" });

            //o token vai só no cookie httpOnly (o JavaScript do navegador não consegue lê-lo)
            res.cookie(NOME_COOKIE, token, { ...opcoesCookie, maxAge: VALIDADE_TOKEN_MS });

            return res.status(200).json({
                message: "Autenticação concluída com sucesso.",
                usuario: dadosUsuario,
            });
        } catch (error) {
            console.error("Erro na verificação do 2FA:", error);
            return res.status(500).json({ message: "Erro interno. Tente mais tarde." });
        }
    }

    static async Logout(req: Request, res: Response) {
        res.clearCookie(NOME_COOKIE, opcoesCookie);
        return res.status(200).json({ message: "Logout com sucesso" });
    }

    static async Reset(req: Request, res: Response) {
        return naoImplementado(res);
    }

    static async forgotPassword(req: Request, res: Response) {
        return naoImplementado(res);
    }
}
