import Mensagem from "../Models/Mensagem.js"

export default class ChatController{
    static async getHistory (requisicao, resposta) {
        try{
            const {tarefaId} = requisicao.params;
            const mensagens = await Mensagem.find({Tarefa:tarefaId})
                .populate ("remetente", "nome email")
                .sort({createAt: 1});
            return resposta.status(200).json({mensagens});
        } catch(error) {
            return resposta.status(500).json({message:"Erro ao enviar sua mensagem"})
        }
    }
    static async sendSavedMessage(io, socket, data){
        try{
            const {tarefaId, remetente, texto } = data;
            const novaMensagem = await Mensagem.create({
                tarefa:tarefaId,
                remetente:remetenteId,
                texto
            });
            const mensagemPopulada = await Menssagem.FindById(novaMensagem._id)
                .populate ("remetente", "nome email")
            io.to(`tarefa_${tarefa.Id}`).emit("receive_message", mensagemPopulada);
        } catch(error) {
            console.error("Erro ao salvar/enviar mensagem no socket:", error)
            socket.emit("chat_error", {message:"Erro ao processar mensagem"});
        }
    } 
}