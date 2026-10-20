// ==================== UsuarioController — REGRAS DE USUÁRIO/AUTENTICAÇÃO ====================
// Métodos: Create, Login, Logout, ForgotPassword, ResetPassword, Profile, getAllExceptLogged.
// Padrão de TODO método: validar entrada (422) -> try { consultar/gravar -> 200 } catch { 500 }.
// Cada método é ligado a uma URL em Routes/routesUsuario.js.

import Usuario from "../Models/Usuario.js";
//import {hash, verify} from "@node-rs/argon2";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { 
    sendPasswordResetEmail, 
} from "../Services/EmailService.js" ;
// Segredo que assina o JWT. Em produção deve vir SEMPRE do .env.
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_muito_forte";
// Duração do COOKIE (1 dia). Atenção: o JWT em si expira em "1h" (ver Login).
const JWT_EXPIRATION_MS = 24*60*60*1000;//um dia em milisegundos
const RESET_TOKEN_EXPIRATION_HOURS = 1;
export default class UsuarioController
{
    // POST /ToDo/createUsuario — cadastra usuário.
    // Body: { nome, email, senha }  |  200 ok, 422 faltou campo, 400 e-mail repetido, 500 erro.
    static async Create(req, res)
    {
        const{nome, email, senha} = req.body;
        if(!nome || !email || !senha )
        {
            return res.status(422).json({message: "Todos os dados são obrigatórios"});
        }
        try {
            //const hashPassword = await hash(senha);
            // NUNCA grave senha pura: argon2 gera um hash lento (e já inclui o "salt").
            const hashPassword = await argon2.hash(senha);
            const usuario= new Usuario({
                nome,
                email,
                senha:hashPassword
            });
            const novoUsuario = await usuario.save();
            // NOTA DE REVISÃO: novoUsuario inclui o hash da senha (select:false não vale para save()).
            // Melhor devolver só { id, nome, email }.
            res.status(200).json({message:"Usuario inserido com sucesso", novoUsuario});
            return;
        } 
        catch (error) {
            // 11000 é o código que o MongoDB dispara quando o 'unique: true' é violado
            if (error.code === 11000) {
                return res.status(400).json({ message: "O e-mail fornecido já está em uso." });
            }
            return res.status(500).json({ message: "Erro ao registrar usuário", error });
        }
        
    };
    // POST /ToDo/login — autentica e grava o JWT em cookie httpOnly.
    // Body: { email, senha }  |  200 { message, usuario }, 422, 400 "Credenciais inválidas", 500.
    static async Login(req, res) {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(422).json({ message: "Todos os dados são obrigatórios" });
    }
    try {
        // .select("+senha") traz o campo que está escondido por select:false.
        const usuario = await Usuario.findOne({ email }).select('+senha');
        if (!usuario || !usuario.senha) {
            return res.status(400).json({ message: "Credenciais inválidas" });
        }

        //const senhaCorreta = await verify(usuario.senha, senha);
        // verify(hashSalvo, senhaDigitada) — compara sem nunca "desfazer" o hash.
        // A mesma mensagem de erro para e-mail/senha errados evita revelar quem tem conta.
        const senhaCorreta = await argon2.verify(usuario.senha, senha);
        if (!senhaCorreta) {
            return res.status(400).json({ message: "Credenciais inválidas" });
        }

        // Payload do JWT: dados mínimos e não sensíveis (nunca a senha).
        const tokenPayload = {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email
        };

        // jwt.sign(payload, segredo, opções): gera o token assinado (expira em 1 hora).
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });

        
        // httpOnly: o JavaScript do navegador não lê o cookie (protege contra XSS).
        // secure:false só porque é HTTP local; em produção (HTTPS) use true.
        // sameSite:"lax" reduz risco de CSRF.
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true apenas em produção (HTTPS)
            sameSite: "lax", //
            maxAge: JWT_EXPIRATION_MS || 3600000 // 1 hora
        });

        return res.status(200).json({
            message: "Login realizado com sucesso",
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ message: "Problema no Login", error });
    }
}

    // POST /ToDo/forgotPassword — inicia a recuperação de senha.
    // Body: { email }  |  responde 200 SEMPRE (não revela se o e-mail existe).
    static async ForgotPassword(req, res)
    {
        const {email} = req.body;
        if(!email)
        {
            return res.status(422).json({message:"e-mail requerido"});
        }
        try
        {
            const usuario = await Usuario.findOne({ email })
            if(!usuario)
            {
                return res.status(200).json({message:"Se o e-mail estiver cadastrado, um link será enviado"});
            }
            // Token aleatório de 32 bytes (64 caracteres hex): impossível de adivinhar.
            const resetToken = crypto.randomBytes(32).toString('hex');
            //const hashToken = await hash(resetToken);
            // No banco vai só o HASH do token (se o banco vazar, o link continua inútil).
            const hashToken = await argon2.hash(resetToken);
            const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000);
            // Salva o hash e a validade (agora + 1 hora) no próprio usuário.
            await Usuario.findByIdAndUpdate(usuario.id, {
                resetToken: hashToken,
                resetTokenExpiry: resetTokenExpiry
            });
            // Sem await de propósito: a resposta não espera o SMTP; erro só é registrado no console.
            // O e-mail leva o token PURO no link do front.
            sendPasswordResetEmail(usuario.email, resetToken).catch(err=>{
                console.error("Falha no envio do e-mail:", err);
            });
            return res.status(200).json({ message: "Se o e-mail estiver cadastrado, um link será enviado" });
        } 
        catch (error)
        {
            return res.status(200).json({message:"Se o e-mail estiver cadastrado, um link será enviado"});
        }
    };
    // POST /ToDo/logout — apaga o cookie (só o servidor consegue, pois é httpOnly).
    static async Logout(req, res)
    {
       try {
        // Limpa o cookie chamado 'jwt'
        res.clearCookie("token", {
            httpOnly: true,
            secure: false, // Altere para true se estiver em produção (HTTPS)
            sameSite: 'lax'
        });

        return res.status(200).json({ message: "Logout realizado com sucesso" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao realizar logout", error });
        }
    };
    // POST /ToDo/resetPassword — troca a senha usando o token do e-mail.
    // Body: { token, novaSenha }  |  200, 400 token inválido/expirado.
    static async ResetPassword(req, res)
    {
        const { token, novaSenha } = req.body;

        if (!token || !novaSenha) {
            return res.status(400).json({ message: "Token e nova senha são obrigatórios." });
        }

        try {
            // Busca usuários que possuem um token válido e não expirado
            // Observação: select('+resetToken +resetTokenExpiry') força a busca desses campos caso estejam ocultos no Schema
            // Candidatos: quem tem token ainda válido. $gt = "greater than" (validade maior que agora).
            // .select("+resetToken ...") pois esses campos têm select:false.
            const usuarios = await Usuario.find({
                resetTokenExpiry: { $gt: Date.now() } // $gt = Greater Than (Data de expiração maior que 'agora')
            }).select('+resetToken +resetTokenExpiry');

            let usuarioValido = null;

            // Compara o token recebido com os hashes salvos no banco
            // Como o token está em hash, não dá para buscar por igualdade: testamos um a um com verify.
            for (const usuario of usuarios) {
                if (usuario.resetToken) {
                    const tokenValido = await argon2.verify(usuario.resetToken, token);
                    if (tokenValido) {
                        usuarioValido = usuario;
                        break;
                    }
                }
            }

            // Se nenhum usuário for encontrado com esse token válido
            if (!usuarioValido) {
                return res.status(400).json({ message: "Token inválido ou expirado." });
            }

            // Hash da nova senha
            const hashNovaSenha = await argon2.hash(novaSenha);
            //const hashNovaSenha = await hash(novaSenha);

            // Atualiza a senha e limpa o token de recuperação
            usuarioValido.senha = hashNovaSenha;
            // Apaga o token: link de uso único.
            usuarioValido.resetToken = undefined;
            usuarioValido.resetTokenExpiry = undefined;

            await usuarioValido.save();

            return res.status(200).json({ message: "Senha redefinida com sucesso!" });

        } catch (error) {
            console.error("Erro no resetPassword:", error);
            return res.status(500).json({ message: "Erro ao redefinir a senha.", error });
        }
    };
    // GET /ToDo/me — devolve o usuário da sessão (rota protegida pelo UserMiddleware).
    // É chamado pelo App.jsx ao abrir o site para saber se há login.
    static async Profile(req, res) {
    try {
        // req.user foi preenchido pelo UserMiddleware a partir do JWT.
        const userToken = req.user;
        console.log("TOKEN/PAYLOAD:", userToken);

        if (!userToken) {
            return res.status(401).json({ message: "Não autenticado" });
        }

        // Extrai o ID do usuário guardado dentro do req.user (pode ser id ou _id dependendo de como salvou no JWT)
        const userId = userToken.id || userToken._id;

        // BUSCA NO BANCO DE DADOS
        
            // O Mongoose já esconde a senha automaticamente por conta do "select: false" no Schema
            // Busca no banco (e não confia só no token). A senha não vem por causa do select:false.
            const dadosUsuario = await Usuario.findById(userId);

        if (!dadosUsuario) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        console.log("USUÁRIO DO BANCO:", dadosUsuario);                    

        // Retorna os dados do banco para o Frontend
        return res.status(200).json({ usuario: dadosUsuario });

    } catch (error) {
        console.error("Erro no Profile:", error);
        return res.status(500).json({ message: "Erro ao buscar usuário", error: error.message });
    }
    }
    // GET /ToDo/getAllUsers — lista usuários (só _id e nome) menos o logado.
    // Usada no TodoForm para escolher os participantes da tarefa.
    static async getAllExceptLogged(req, res) {
        try {
            const usuarioLogado = req.user.id;
            console.log("Usuário Logado " + usuarioLogado);
            // $ne = "not equal" (diferente). .select("nome") projeta só o necessário. .sort({nome:1}) = A-Z.
            const usuarios = await Usuario.find({_id:{$ne:usuarioLogado}})
            .select("nome")
            .sort({nome:1});
            console.log(usuarios);
            return res.status(200).json({usuarios});
        }
        catch(error){
            return res.status(500).json({message:"Problema ao buscar usuários", error})
        }
    }
};
