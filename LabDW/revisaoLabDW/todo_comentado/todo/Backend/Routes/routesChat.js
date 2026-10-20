// ==================== Rotas do Chat (HTTP) ====================
// Só o histórico é HTTP; as mensagens novas trafegam pelo Socket.IO (Socket/registerChatSocket.js).

import {Router} from "express";
import ChatController from "../Controllers/ChatController.js";
import UserMiddleware from "../Middleware/UserMiddleware.js";
const routesChat = new Router();


// GET /ToDo/getHistory/:tarefaId  (PRIVADA)
// NOTA: este arquivo não está na lista do swagger.js, por isso a rota não aparece no /docs.
routesChat.get("/getHistory/:tarefaId", UserMiddleware, ChatController.getHistory);

export default routesChat;