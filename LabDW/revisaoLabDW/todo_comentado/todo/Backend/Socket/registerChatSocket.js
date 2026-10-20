// ==================== registerChatSocket — EVENTOS DO CHAT ====================
// Chamado em index.js para CADA cliente conectado (io.on("connect")).
// Socket não tem URL/verbo: usa NOMES DE EVENTO.
// Sala (room) = grupo de sockets. Aqui: uma sala por tarefa, "tarefa_<id>".
// Cliente emite: join_task, send_message, leave_task | Servidor emite: receive_message, chat_error.

import ChatController from "../Controllers/ChatController.js";
export default function registerChatSocket(io, socket){
    //entrar em um chat específico (de uma tarefa)
    // Front: socketRef.current.emit("join_task", tarefa._id) em TodoChatModal.jsx.
    socket.on("join_task", (tarefaId)=>{
        socket.join(`tarefa_${tarefaId}`);
        console.log(`socket ${socket.id} entrou no chat da tarefa_${tarefaId}`);
    });
    //enviar a mensagem
    // Delegamos ao Controller (regra de negócio fora do arquivo de eventos).
    // Front: emit("send_message", {tarefaId, remetenteId, texto}).
    socket.on("send_message", (data)=>{
        ChatController.sendSaveMessage(io, socket, data);
    });

    //sair do chat
    // Chamado ao fechar o modal (cleanup do useEffect no front).
    socket.on("leave_task", (tarefaId)=>{
        socket.leave(`tarefa_${tarefaId}`);
    });
}