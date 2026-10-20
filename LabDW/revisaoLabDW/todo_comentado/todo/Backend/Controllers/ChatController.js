// ==================== ChatController — CHAT DAS TAREFAS ====================
// getHistory -> chamado por HTTP (Routes/routesChat.js).
// sendSaveMessage -> chamado pelo SOCKET (Socket/registerChatSocket.js), por isso recebe io e socket.

import Mensagem from "../Models/Mensagem.js";
export default class ChatController{
    // GET /ToDo/getHistory/:tarefaId — mensagens antigas (carregadas ao abrir o modal).
    static async getHistory(req, res){
        try {
            const {tarefaId} = req.params;
            // populate("remetente","nome email") troca o id pelo usuário (só nome e e-mail).
            // sort({createdAt:1}) = mais antigas primeiro.
            const mensagens = await Mensagem.find({tarefa:tarefaId})
                .populate("remetente", "nome email")
                .sort({createdAt: 1});
            return res.status(200).json({mensagens});
        } catch (error) {
            return res.status(500).json({message:"Problema ao buscar o histórico das mensagens", error});
        }
    }
    // Evento "send_message": 1) grava no banco, 2) retransmite para a sala da tarefa.
    // Salvar antes de transmitir garante que o histórico exista depois.
    static async sendSaveMessage(io, socket, data){
        try {
            // NOTA DE REVISÃO: remetenteId vem do cliente; qualquer um poderia se passar por outro.
            // Ideal: autenticar o socket (cookie/JWT) e usar o id do token.
            const {tarefaId, remetenteId, texto} =  data;
            // create() = new + save() em uma chamada.
            const novaMensagem = await Mensagem.create({
                tarefa: tarefaId,
                remetente: remetenteId,
                texto
            });
            // Busca de novo já com o remetente populado, para o front exibir o nome.
            const mensagemPopulada = await Mensagem.findById(novaMensagem._id)
                .populate("remetente", "nome email");
            // io.to(sala).emit(evento, dados): envia SÓ para quem entrou na sala "tarefa_<id>".
            io.to(`tarefa_${tarefaId}`).emit("receive_message", mensagemPopulada);

        } catch (error) {
            console.error("Erro ao salvar/enviar mensagem no socket:", error);
            // socket.emit responde apenas ao socket que enviou (quem errou).
            socket.emit("chat_error",{message: "Erro ao processar mensagem"});
        }
    }
}//fim da classe