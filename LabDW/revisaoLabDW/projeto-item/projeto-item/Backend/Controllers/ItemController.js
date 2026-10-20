// ==================== ItemController — CRUD COMPLETO ====================
// Create, getAll (filtros/paginação), getById, Update, updateSituacao, finalizarTodos, Delete, Resumo.
// Padrão de todo método: validar (422) -> try -> consultar -> responder -> catch (500).

import Item from "../Models/Item.js";
import Mensagem from "../Models/Mensagem.js";
import { Types } from "mongoose";

const escapeRegex = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // evita regex injection na busca

export default class ItemController {

    // CREATE — POST /App/item/create
    static async Create(req, res) {
        const { titulo, descricao, dataLimite, participam } = req.body;
        if (!titulo || !descricao || !dataLimite) {
            return res.status(422).json({ message: "Todos os dados são obrigatórios" });
        }
        try {
            const item = new Item({
                titulo,
                descricao,
                dataLimite,
                participam: participam || [],
                dono: req.user.id,          // vem do JWT, nunca do body
                situacao: "Pendente"        // o servidor decide o estado inicial
            });
            const novoItem = await item.save();
            return res.status(200).json({ message: "Item inserido com sucesso", novoItem });
        } catch (error) {
            return res.status(500).json({ message: "Problema ao inserir o item", error });
        }
    }

    // READ (lista) — GET /App/item/getAll?busca=abc&situacao=Pendente&de=2026-01-01&ate=2026-12-31&ordem=desc&page=1&limit=10
    static async getAll(req, res) {
        try {
            const { busca, situacao, de, ate, ordem, page = 1, limit = 50 } = req.query;
            const filtro = { dono: req.user.id };
            if (situacao) filtro.situacao = situacao;
            if (busca) filtro.titulo = { $regex: escapeRegex(busca), $options: "i" }; // contém, sem diferenciar maiúsculas
            if (de || ate) {
                filtro.dataLimite = {};
                if (de) filtro.dataLimite.$gte = new Date(de);   // >=
                if (ate) filtro.dataLimite.$lte = new Date(ate); // <=
            }
            const pagina = Math.max(parseInt(page, 10) || 1, 1);
            const limite = Math.min(parseInt(limit, 10) || 50, 100);
            const itens = await Item.find(filtro)
                .populate("participam", "nome email")                // troca ids pelos usuários
                .sort({ dataLimite: ordem === "desc" ? -1 : 1 })     // 1 = crescente, -1 = decrescente
                .skip((pagina - 1) * limite)
                .limit(limite);
            const total = await Item.countDocuments(filtro);
            return res.status(200).json({ message: "Itens buscados com sucesso", itens, total, pagina });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar os itens", error });
        }
    }

    // READ (um) — GET /App/item/getById/:id
    static async getById(req, res) {
        const { id } = req.params;
        if (!Types.ObjectId.isValid(id)) {
            return res.status(422).json({ message: "ID inválido" });
        }
        try {
            const item = await Item.findOne({ _id: id, dono: req.user.id }).populate("participam", "nome email");
            if (!item) {
                return res.status(404).json({ message: "Item não encontrado" });
            }
            return res.status(200).json({ item });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar o item", error });
        }
    }

    // UPDATE (edição de campos) — PUT /App/item/update/:id
    static async Update(req, res) {
        const { id } = req.params;
        if (!Types.ObjectId.isValid(id)) {
            return res.status(422).json({ message: "ID inválido" });
        }
        // lista branca: só estes campos podem ser editados (o cliente não altera dono nem situação aqui)
        const camposEditaveis = ["titulo", "descricao", "dataLimite", "participam"];
        const dados = {};
        for (const campo of camposEditaveis) {
            if (req.body[campo] !== undefined) dados[campo] = req.body[campo];
        }
        if (Object.keys(dados).length === 0) {
            return res.status(422).json({ message: "Nenhum campo para atualizar" });
        }
        try {
            const atualizado = await Item.findOneAndUpdate(
                { _id: id, dono: req.user.id },
                dados,
                { new: true, runValidators: true }   // new: devolve o já alterado | runValidators: aplica o Schema
            );
            if (!atualizado) {
                return res.status(404).json({ message: "Item não encontrado" });
            }
            return res.status(200).json({ message: "Item atualizado com sucesso", item: atualizado });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar o item", error });
        }
    }

    // UPDATE (máquina de estados) — PATCH /App/item/updateSituacao/:id   (só Pendente muda)
    static async updateSituacao(req, res) {
        const { id } = req.params;
        const { situacao } = req.body;
        const permitidas = ["Finalizada", "Cancelada"];
        if (!Types.ObjectId.isValid(id)) {
            return res.status(422).json({ message: "ID inválido" });
        }
        if (!permitidas.includes(situacao)) {
            return res.status(422).json({ message: "Situação inválida. Use Finalizada ou Cancelada" });
        }
        try {
            const item = await Item.findOne({ _id: id, dono: req.user.id });
            if (!item) {
                return res.status(404).json({ message: "Item não encontrado" });
            }
            if (item.situacao !== "Pendente") {
                return res.status(409).json({ message: `Este item já está ${item.situacao.toLowerCase()} e não pode ser alterado` });
            }
            item.situacao = situacao;
            const itemAtualizado = await item.save();
            return res.status(200).json({ message: "Situação atualizada com sucesso", item: itemAtualizado });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar a situação", error });
        }
    }

    // UPDATE em massa — PATCH /App/item/finalizarTodos
    static async finalizarTodos(req, res) {
        try {
            const resultado = await Item.updateMany(
                { dono: req.user.id, situacao: "Pendente" },
                { $set: { situacao: "Finalizada" } }
            );
            return res.status(200).json({ message: "Itens finalizados", alterados: resultado.modifiedCount });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao finalizar os itens", error });
        }
    }

    // DELETE — DELETE /App/item/delete/:id
    static async Delete(req, res) {
        const { id } = req.params;
        if (!Types.ObjectId.isValid(id)) {
            return res.status(422).json({ message: "ID inválido" });
        }
        try {
            const removido = await Item.findOneAndDelete({ _id: id, dono: req.user.id });
            if (!removido) {
                return res.status(404).json({ message: "Item não encontrado" });
            }
            await Mensagem.deleteMany({ item: id });   // exclusão em cascata das mensagens do chat
            return res.status(200).json({ message: "Item removido com sucesso" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao remover o item", error });
        }
    }

    // RELATÓRIO (agregação para gráficos) — GET /App/item/resumo
    static async Resumo(req, res) {
        try {
            const resumo = await Item.aggregate([
                { $match: { dono: new Types.ObjectId(req.user.id) } },  // aggregate NÃO converte string em ObjectId
                { $group: { _id: "$situacao", total: { $sum: 1 } } },
                { $sort: { total: -1 } }
            ]);
            return res.status(200).json({ resumo }); // ex.: [{ _id: "Pendente", total: 3 }, ...]
        } catch (error) {
            return res.status(500).json({ message: "Erro ao gerar o resumo", error });
        }
    }
}
