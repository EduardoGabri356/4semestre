// ==================== Rotas do Chat (HTTP) ==================== só o histórico; o resto é Socket

import { Router } from "express";
import ChatController from "../Controllers/ChatController.js";
import UserMiddleware from "../Middleware/UserMiddleware.js";

const routesChat = new Router();
routesChat.get("/getHistory/:itemId", UserMiddleware, ChatController.getHistory);
export default routesChat;
