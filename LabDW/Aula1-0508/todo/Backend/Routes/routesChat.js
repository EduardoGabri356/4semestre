import { Router } from "express";
import ChatController from "../Controllers/ChatController.js";
import UserMiddleware from "../Middleware/UserMiddleware.js";

const routesChat = Router();

routesChat.get("/mensagens/:tarefaId", UserMiddleware, ChatController.getHistory);

export default routesChat;