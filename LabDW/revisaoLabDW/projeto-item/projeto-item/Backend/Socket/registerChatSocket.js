// ==================== registerChatSocket — EVENTOS DO CHAT ====================
// Cliente emite: join_item, send_message, leave_item | Servidor emite: receive_message, chat_error.
// Sala (room) = "item_<id>".

import ChatController from "../Controllers/ChatController.js";

export default function registerChatSocket(io, socket) {
    socket.on("join_item", (itemId) => ChatController.joinRoom(socket, itemId));
    socket.on("send_message", (data) => ChatController.sendSaveMessage(io, socket, data));
    socket.on("leave_item", (itemId) => socket.leave(`item_${itemId}`));
}
