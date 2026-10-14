import Tarefa from "../Models/Tarefa.js";
import {Types} from "mongoose";
export default class TarefaController{
    static async Create(req, res){
        const{titulo, descricao, dataLimite, participam} = req.body;
        if(!titulo || !descricao || !dataLimite)
        {
            return res.status(422).json({message: "Todos os dados são obrigatórios"});
        }
        try {
            // toda tarefa nova começa como Pendente
            const tarefa = new Tarefa({
                titulo,
                descricao,
                dataLimite,
                participam: participam || [],
                situacao: "Pendente"
            });
            const novaTarefa = await tarefa.save();
            res.status(200).json({message:"Tarefa inserida com sucesso", novaTarefa});
            return;
        } catch (error) {
            return res.status(500).json({message:"Problema ao inserir uma tarefa", error});
        }
    }//fim create
    static async getAll(req, res){
        try {
            const tarefas = await Tarefa.find();
            return res.status(200).json({message:"Buscar tarefas com sucesso", tarefas});
        } catch (error) {
            return res.status(500).json({message:"Erro ao buscar todas tarefas", error});
        }

    }//fim getAll
    // muda a situação de Pendente para Finalizada ou Cancelada
    static async updateSituacao(req, res){
        const {id} = req.params;
        const {situacao} = req.body;
        const permitidas = ["Finalizada", "Cancelada"];
        if(!Types.ObjectId.isValid(id)){
            return res.status(422).json({message:"ID da tarefa inválido"});
        }
        if(!permitidas.includes(situacao)){
            return res.status(422).json({message:"Situação inválida. Use Finalizada ou Cancelada"});
        }
        try {
            const tarefa = await Tarefa.findById(id);
            if(!tarefa){
                return res.status(404).json({message:"Tarefa não encontrada"});
            }
            if(tarefa.situacao !== "Pendente"){
                return res.status(409).json({message:`Esta tarefa já está ${tarefa.situacao.toLowerCase()} e não pode ser alterada`});
            }
            tarefa.situacao = situacao;
            const tarefaAtualizada = await tarefa.save();
            return res.status(200).json({message:"Situação atualizada com sucesso", tarefa: tarefaAtualizada});
        } catch (error) {
            return res.status(500).json({message:"Erro ao atualizar a situação da tarefa", error});
        }
    }//fim updateSituacao
}
