// ==================== index.js — PONTO DE ENTRADA DO BACKEND ====================
// Subproblema: subir UM servidor que atende REST (Express) e WebSocket (Socket.IO).
// Ordem importa: dotenv -> middlewares globais -> swagger -> rotas -> listen.
// Reutilizável em qualquer API Node/Express.

import "dotenv/config"; //tem que ser a primeira linha no index.js
import express from "express";
//websocket
import {Server} from "socket.io";
//juntar o express e websocket
import {createServer} from "http";
import registerChatSocket from "./Socket/registerChatSocket.js";
import cors from "cors";
import routesTarefa from "./Routes/routesTarefa.js";
import routesUsuario from "./Routes/routesUsuario.js";
import routesChat from "./Routes/routesChat.js";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
import cookieParser from "cookie-parser";

// Lê do .env; o valor depois de || é o padrão caso a variável não exista.
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
//suporte para importar arquivos json usando ESModules
// Em ES Modules (type: "module") não existe require().
// createRequire permite importar o swagger-output.json (gerado por "npm run swagger").
const require = createRequire(import.meta.url);
const swaggerDocument = require("./swagger-output.json");
// app = aplicação Express (rotas REST).
const app = new express();
//comunicação entre front e back usar json
// Middleware: converte o corpo JSON da requisição em req.body.
app.use(express.json());

// CORS: só o front (FRONTEND_URL) pode chamar a API.
// credentials:true permite enviar/receber cookies (o JWT viaja em cookie).
app.use(cors({
    credentials: true, 
    origin: FRONTEND_URL
}));
// Middleware: preenche req.cookies (o UserMiddleware lê o token daqui).
app.use(cookieParser());
//criar um servidor Http
// Socket.IO precisa de um servidor HTTP "cru". Criamos um e entregamos o Express a ele:
// assim REST e WebSocket compartilham a mesma porta.
const httpServer = createServer(app);
//iniciar o websocket
// Liga o WebSocket em cima do mesmo servidor (com o mesmo CORS).
const io = new Server(httpServer,{
    cors:{
        origin: FRONTEND_URL,
        credentials: true,
    }
}); 
// Executa a cada cliente conectado; registra os eventos do chat para ESSE socket.
io.on("connect", (socket)=>{
    console.log(`Usuário Conectado: ${socket.id}`);
    registerChatSocket(io, socket);
    socket.on("disconnect", ()=>{
        console.log(`Usuário desconectou: ${socket.id}`);

    });
});

//obrigatoriamente o swagger deve vir antes das rotas
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Prefixo "/ToDo" + caminho do arquivo de rotas = URL final.
// Ex.: routesUsuario.post("/login") vira POST http://localhost:5000/ToDo/login
app.use("/ToDo", routesTarefa);
app.use("/ToDo", routesUsuario);
app.use("/ToDo", routesChat);
// ATENÇÃO: listen no httpServer (e não app.listen), senão o Socket.IO não funciona.
httpServer.listen(PORT, ()=>{
    console.log(`Servidor rodando na porta ${PORT}`);
});