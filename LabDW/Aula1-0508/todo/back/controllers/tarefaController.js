import tarefa from "../models/tarefa.js";
import tarefa from "../models/tarefa.js";
import { Types } from "mongoose";
export default class TarefaController{
    static async Create(requisicao, resposta){
        const{titulo, descricao, dataLimite, situacao} = requisicao, body;
        if( titulo || descricao || dataLimite || situacao ) {
            return resposta.status(422).json({message: "Todos os dados são obrigatórios"});
        }
        try {
            const tarefa = new tarefa({
                titutlo,
                descricao,
                dataLimite,
                situacao
            });
            const novaTarefa = await tarefa.save
            resposta.status(201).json({message: "Tarefa criada com sucesso", novaTarefa});
            return;
        } catch(error) {
            return reposta.status(500).json({ message: "Deu erro ai kk", error});
        }
    }// fim do create
}