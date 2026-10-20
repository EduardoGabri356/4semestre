// ==================== ChatController — CHAT DOS ITENS ====================
// getHistory é HTTP; joinRoom e sendSaveMessage são chamados pelo Socket (por isso recebem io/socket).

import Mensagem from "../Models/Mensagem.js";
import Item from "../Models/Item.js";
import { Types } from "mongoose";

// só dono ou participante acessa o chat
const podeAcessar = (itemId, usuarioId) =>
    Item.exists({ _id: itemId, $or: [{ dono: usuarioId }, { participam: usuarioId }] });

export default class ChatController {

    // GET /App/getHistory/:itemId  (privada)
    static async getHistory(req, res) {
        const { itemId } = req.params;
        if (!Types.ObjectId.isValid(itemId)) {
            return res.status(422).json({ message: "ID inválido" });
        }
        try {
            if (!(await podeAcessar(itemId, req.user.id))) {
                return res.status(403).json({ message: "Sem acesso a este chat" });
            }
            const mensagens = await Mensagem.find({ item: itemId })
                .populate("remetente", "nome email")   // "JOIN": traz só nome e e-mail
                .sort({ createdAt: 1 });               // antigas primeiro
            return res.status(200).json({ mensagens });
        } catch (error) {
            return res.status(500).json({ message: "Problema ao buscar o histórico", error });
        }
    }

    // evento join_item
    static async joinRoom(socket, itemId) {
        try {
            if (Types.ObjectId.isValid(itemId) && (await podeAcessar(itemId, socket.user.id))) {
                socket.join(`item_${itemId}`);
            } else {
                socket.emit("chat_error", { message: "Sem acesso a este chat" });
            }
        } catch (error) {
            socket.emit("chat_error", { message: "Erro ao entrar no chat" });
        }
    }

    // evento send_message  { itemId, texto }
    static async sendSaveMessage(io, socket, data) {
        try {
            const { itemId, texto } = data;
            if (!texto || !texto.trim()) return;
            if (!(await podeAcessar(itemId, socket.user.id))) {
                return socket.emit("chat_error", { message: "Sem acesso a este chat" });
            }
            const nova = await Mensagem.create({ item: itemId, remetente: socket.user.id, texto });  // grava ANTES
            const populada = await Mensagem.findById(nova._id).populate("remetente", "nome email");
            io.to(`item_${itemId}`).emit("receive_message", populada);   // só a sala recebe
        } catch (error) {
            console.error("Erro ao salvar/enviar mensagem:", error);
            socket.emit("chat_error", { message: "Erro ao processar mensagem" });   // só quem enviou
        }
    }
}
