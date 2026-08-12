import Tarefa from "../models/Tarefa.js";
import { Types } from "mongoose";

export default class TarefaController {
    static async Create(requisicao, resposta) {
        const { titulo, descricao, dataLimite, situacao } = requisicao.body;

        if (!titulo || !descricao || !dataLimite || !situacao) {
            return resposta.status(422).json({ message: "Todos os dados são obrigatórios" });
        }

        try {
            const novaTarefa = new Tarefa({
                titulo,
                descricao,
                dataLimite,
                situacao
            });

            await novaTarefa.save();
            return resposta.status(201).json({ message: "Tarefa criada com sucesso", novaTarefa });
        } catch (error) {
            return resposta.status(500).json({ message: "Deu erro ai kk", error });
        }
    } // fim do create


    static async GetAll(requisicao, resposta) {
        try {
            const tarefas = await Tarefa.find();
            return resposta.status(200).json({ message: "Tarefas encontradas com sucesso", tarefas });
        } catch (error) {
            return resposta.status(500).json({ message: "Deu erro ai kk", error });
        }
    } // fim do getAll
}