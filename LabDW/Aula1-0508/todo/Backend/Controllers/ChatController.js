import Mensagem from "../Models/Mensagem.js";

export default class ChatController {
    static async getHistory(requisicao, resposta) {
        try {
            const { tarefaId } = requisicao.params;
            const mensagens = await Mensagem.find({ tarefa: tarefaId })
                .populate("remetente", "nome email")
                .sort({ createdAt: 1 });
            return resposta.status(200).json({ mensagens });
        } catch (error) {
            return resposta.status(500).json({ message: "Erro ao buscar mensagens" });
        }
    }

    static async sendSavedMessage(io, socket, data) {
        try {
            const { tarefaId, remetente, texto } = data;
            const novaMensagem = await Mensagem.create({
                tarefa: tarefaId,
                remetente: remetente,
                texto
            });
            const mensagemPopulada = await Mensagem.findById(novaMensagem._id)
                .populate("remetente", "nome email");
            io.to(`tarefa_${tarefaId}`).emit("receive_message", mensagemPopulada);
        } catch (error) {
            console.error("Erro ao salvar/enviar mensagem no socket:", error);
            socket.emit("chat_error", { message: "Erro ao processar mensagem" });
        }
    }
}