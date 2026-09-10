import ChatController from "../Controllers/ChatController.js";

export default function registerChatSocket(io, socket){
    //entrar em um chat especifico de uma tarefa
    // aqui sempre vai ser um texto
    socket.on("Join_task", (tarefaId) =>{
        socket.join(`tarefa_${tarefaId}`);
        console.log(`socket ${socket.id} entrou no chat da tarefa_${tarefaId}`)
    });
    // enviar a mensgaem
    socket.on("send_mensagem", (data) => {
    ChatController.sendSavedMessage(io, socket, data);
    });

    //sair do chat
    socket.on("leave_task", (tarefaId) =>{
        socket.leave(`tarefa_${tarefaId}`);
    });
}