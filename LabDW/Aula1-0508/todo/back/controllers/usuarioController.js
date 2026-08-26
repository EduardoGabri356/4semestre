import Usuario from "../models/Usuario.js";
import argon2 from "argon2"

export default class usuarioController {
    static async Create(requisicao, resposta) {
        const { nome, email, senha } = requisicao.body;

        if (!nome || !email || !senha ) {
            return resposta.status(422).json({ message: "Todos os dados são obrigatórios" });
        }

        try {
            const hashPassword = await argon2.hash(senha);
            const usuario = new Usuario({
                nome,
                email,
                senha: hashPassword,
            });

            const novoUsuario = await usuario.save();
            return resposta.status(201).json({ message: "Usuario criado com sucesso", novaTarefa });
        } catch (error) {
            return resposta.status(500).json({ message: "Deu erro ai kk", error });
        }
    } // fim do create
}