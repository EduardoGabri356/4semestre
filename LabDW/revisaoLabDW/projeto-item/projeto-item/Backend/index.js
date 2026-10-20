// ==================== index.js — PONTO DE ENTRADA DO BACKEND ====================
// Sobe UM servidor que atende REST (Express) e WebSocket (Socket.IO) na mesma porta.
// Ordem: dotenv -> middlewares globais -> socket -> swagger -> rotas -> listen.

import "dotenv/config"; // TEM que ser a primeira linha
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
import registerChatSocket from "./Socket/registerChatSocket.js";
import routesItem from "./Routes/routesItem.js";
import routesUsuario from "./Routes/routesUsuario.js";
import routesChat from "./Routes/routesChat.js";

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const require = createRequire(import.meta.url);          // importar JSON em ES Modules
const swaggerDocument = require("./swagger-output.json");

const app = express();
app.use(express.json());                                  // req.body em JSON
app.use(cors({ credentials: true, origin: FRONTEND_URL })); // cookies entre 5173 e 5000
app.use(cookieParser());                                  // req.cookies

const httpServer = createServer(app);                     // REST + WebSocket na mesma porta
const io = new Server(httpServer, { cors: { origin: FRONTEND_URL, credentials: true } });

// (OPCIONAL) autentica o socket lendo o JWT do cookie. Depois use socket.user.id.
io.use((socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie || "";
        const par = cookieHeader.split(";").map((c) => c.trim()).find((c) => c.startsWith("token="));
        if (!par) return next(new Error("Não autenticado"));
        socket.user = jwt.verify(par.slice("token=".length), process.env.JWT_SECRET);
        next();
    } catch (error) {
        next(new Error("Token inválido"));
    }
});

io.on("connection", (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);
    registerChatSocket(io, socket);
    socket.on("disconnect", () => console.log(`Usuário desconectou: ${socket.id}`));
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // swagger ANTES das rotas
app.use("/App", routesItem);      // URL final = /App + caminho da rota
app.use("/App", routesUsuario);
app.use("/App", routesChat);

httpServer.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
