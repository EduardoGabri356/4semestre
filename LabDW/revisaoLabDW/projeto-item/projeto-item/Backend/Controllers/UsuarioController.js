// ==================== UsuarioController — AUTENTICAÇÃO E CONTA ====================
// Create, Login, Logout, Profile, UpdateProfile, ChangePassword, DeleteAccount, getAllExceptLogged,
// ForgotPassword, ResetPassword.

import Usuario from "../Models/Usuario.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../Services/EmailService.js";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_MAX_AGE = 60 * 60 * 1000;      // 1 hora (igual ao expiresIn do JWT)
const RESET_TOKEN_EXPIRATION_HOURS = 1;
const cookieOpcoes = { httpOnly: true, secure: false, sameSite: "lax" }; // secure:true em produção (HTTPS)

export default class UsuarioController {

    // POST /App/createUsuario
    static async Create(req, res) {
        const { nome, email, senha } = req.body;
        if (!nome || !email || !senha) {
            return res.status(422).json({ message: "Todos os dados são obrigatórios" });
        }
        try {
            const hashPassword = await argon2.hash(senha);
            const usuario = new Usuario({ nome, email, senha: hashPassword });
            const novo = await usuario.save();
            // NÃO devolva o hash: responda só o necessário
            return res.status(200).json({ message: "Usuário inserido com sucesso", usuario: { id: novo._id, nome: novo.nome, email: novo.email } });
        } catch (error) {
            if (error.code === 11000) { // violação do unique:true
                return res.status(400).json({ message: "O e-mail fornecido já está em uso." });
            }
            return res.status(500).json({ message: "Erro ao registrar usuário", error });
        }
    }

    // POST /App/login  — grava o JWT em cookie httpOnly
    static async Login(req, res) {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return res.status(422).json({ message: "Todos os dados são obrigatórios" });
        }
        try {
            const usuario = await Usuario.findOne({ email }).select("+senha"); // traz o campo escondido
            if (!usuario || !(await argon2.verify(usuario.senha, senha))) {
                return res.status(400).json({ message: "Credenciais inválidas" }); // mesma msg para os 2 casos
            }
            const token = jwt.sign(
                { id: usuario._id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
                JWT_SECRET,
                { expiresIn: "1h" }
            );
            res.cookie("token", token, { ...cookieOpcoes, maxAge: COOKIE_MAX_AGE });
            return res.status(200).json({
                message: "Login realizado com sucesso",
                usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email }
            });
        } catch (error) {
            return res.status(500).json({ message: "Problema no Login", error });
        }
    }

    // POST /App/logout
    static async Logout(req, res) {
        res.clearCookie("token", cookieOpcoes);
        return res.status(200).json({ message: "Logout realizado com sucesso" });
    }

    // GET /App/me  (privada) — usado pelo front para saber se há sessão
    static async Profile(req, res) {
        try {
            const usuario = await Usuario.findById(req.user.id);
            if (!usuario) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }
            return res.status(200).json({ usuario });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar usuário", error: error.message });
        }
    }

    // PUT /App/updateProfile  (privada) — edita nome e e-mail
    static async UpdateProfile(req, res) {
        const { nome, email } = req.body;
        if (!nome || !email) {
            return res.status(422).json({ message: "Nome e e-mail são obrigatórios" });
        }
        try {
            const usuario = await Usuario.findByIdAndUpdate(req.user.id, { nome, email }, { new: true, runValidators: true });
            return res.status(200).json({ message: "Perfil atualizado", usuario });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ message: "O e-mail fornecido já está em uso." });
            }
            return res.status(500).json({ message: "Erro ao atualizar o perfil", error });
        }
    }

    // PATCH /App/changePassword  (privada) — troca a senha sabendo a atual
    static async ChangePassword(req, res) {
        const { senhaAtual, novaSenha } = req.body;
        if (!senhaAtual || !novaSenha) {
            return res.status(422).json({ message: "Senha atual e nova senha são obrigatórias" });
        }
        try {
            const usuario = await Usuario.findById(req.user.id).select("+senha");
            if (!usuario || !(await argon2.verify(usuario.senha, senhaAtual))) {
                return res.status(400).json({ message: "Senha atual incorreta" });
            }
            usuario.senha = await argon2.hash(novaSenha);
            await usuario.save();
            return res.status(200).json({ message: "Senha alterada com sucesso" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao alterar a senha", error });
        }
    }

    // DELETE /App/deleteAccount  (privada)
    static async DeleteAccount(req, res) {
        try {
            await Usuario.findByIdAndDelete(req.user.id);
            res.clearCookie("token", cookieOpcoes);
            return res.status(200).json({ message: "Conta removida com sucesso" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao remover a conta", error });
        }
    }

    // GET /App/getAllUsers  (privada) — para escolher participantes
    static async getAllExceptLogged(req, res) {
        try {
            const usuarios = await Usuario.find({ _id: { $ne: req.user.id } }) // $ne = diferente de
                .select("nome")
                .sort({ nome: 1 });
            return res.status(200).json({ usuarios });
        } catch (error) {
            return res.status(500).json({ message: "Problema ao buscar usuários", error });
        }
    }

    // POST /App/forgotPassword — responde 200 SEMPRE (não revela se o e-mail existe)
    static async ForgotPassword(req, res) {
        const { email } = req.body;
        if (!email) {
            return res.status(422).json({ message: "e-mail requerido" });
        }
        const resposta = { message: "Se o e-mail estiver cadastrado, um link será enviado" };
        try {
            const usuario = await Usuario.findOne({ email });
            if (!usuario) {
                return res.status(200).json(resposta);
            }
            const resetToken = crypto.randomBytes(32).toString("hex");  // token puro vai no e-mail
            const hashToken = await argon2.hash(resetToken);            // só o hash vai para o banco
            await Usuario.findByIdAndUpdate(usuario.id, {
                resetToken: hashToken,
                resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000)
            });
            sendPasswordResetEmail(usuario.email, resetToken).catch((err) => console.error("Falha no envio do e-mail:", err));
            return res.status(200).json(resposta);
        } catch (error) {
            return res.status(200).json(resposta);
        }
    }

    // POST /App/resetPassword  { token, novaSenha }
    static async ResetPassword(req, res) {
        const { token, novaSenha } = req.body;
        if (!token || !novaSenha) {
            return res.status(400).json({ message: "Token e nova senha são obrigatórios." });
        }
        try {
            // candidatos: tokens ainda válidos ($gt = maior que agora)
            const usuarios = await Usuario.find({ resetTokenExpiry: { $gt: Date.now() } }).select("+resetToken +resetTokenExpiry");
            let usuarioValido = null;
            for (const usuario of usuarios) {
                if (usuario.resetToken && (await argon2.verify(usuario.resetToken, token))) {
                    usuarioValido = usuario;
                    break;
                }
            }
            if (!usuarioValido) {
                return res.status(400).json({ message: "Token inválido ou expirado." });
            }
            usuarioValido.senha = await argon2.hash(novaSenha);
            usuarioValido.resetToken = undefined;        // uso único
            usuarioValido.resetTokenExpiry = undefined;
            await usuarioValido.save();
            return res.status(200).json({ message: "Senha redefinida com sucesso!" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao redefinir a senha.", error });
        }
    }
}
