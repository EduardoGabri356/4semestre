// ==================== TarefaController — CRUD DE TAREFAS ====================
// Métodos: Create, getAll, updateSituacao (ligados em Routes/routesTarefa.js).

import Tarefa from "../Models/Tarefa.js";
import {Types} from "mongoose";
export default class TarefaController{
    // POST /ToDo/create — cria tarefa.
    // Body: { titulo, descricao, dataLimite, participam? }  |  200, 422, 500.
    static async Create(req, res){
        const{titulo, descricao, dataLimite, participam} = req.body;
        if(!titulo || !descricao || !dataLimite)
        {
            return res.status(422).json({message: "Todos os dados são obrigatórios"});
        }
        try {
            // toda tarefa nova começa como Pendente
            // Toda tarefa nasce "Pendente": o servidor decide o estado inicial (o cliente não manda).
            const tarefa = new Tarefa({
                titulo,
                descricao,
                dataLimite,
                participam: participam || [],
                situacao: "Pendente"
            });
            // save() valida pelo Schema e grava no MongoDB.
            const novaTarefa = await tarefa.save();
            res.status(200).json({message:"Tarefa inserida com sucesso", novaTarefa});
            return;
        } catch (error) {
            return res.status(500).json({message:"Problema ao inserir uma tarefa", error});
        }
    }//fim create
    // GET /ToDo/getAll — lista as tarefas.
    // NOTA DE REVISÃO: sem login e sem filtro; devolve a de todos os usuários.
    static async getAll(req, res){
        try {
            // find() sem filtro = todos os documentos da coleção.
            const tarefas = await Tarefa.find();
            return res.status(200).json({message:"Buscar tarefas com sucesso", tarefas});
        } catch (error) {
            return res.status(500).json({message:"Erro ao buscar todas tarefas", error});
        }

    }//fim getAll
    // PATCH /ToDo/updateSituacao/:id — máquina de estados: Pendente -> Finalizada | Cancelada.
    // Body: { situacao }  |  200, 422 (id/valor inválido), 404, 409 (já finalizada/cancelada), 500.
    // muda a situação de Pendente para Finalizada ou Cancelada
    static async updateSituacao(req, res){
        const {id} = req.params;
        const {situacao} = req.body;
        // Lista branca: o cliente não pode "voltar" para Pendente nem inventar valores.
        const permitidas = ["Finalizada", "Cancelada"];
        // Valida o formato do id antes de consultar (evita erro de cast do Mongoose).
        if(!Types.ObjectId.isValid(id)){
            return res.status(422).json({message:"ID da tarefa inválido"});
        }
        if(!permitidas.includes(situacao)){
            return res.status(422).json({message:"Situação inválida. Use Finalizada ou Cancelada"});
        }
        try {
            // Busca a tarefa atual para checar a regra de negócio.
            const tarefa = await Tarefa.findById(id);
            if(!tarefa){
                return res.status(404).json({message:"Tarefa não encontrada"});
            }
            // 409 Conflict: a requisição é válida, mas conflita com o estado atual do recurso.
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
