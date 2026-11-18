import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import type { ErrorRequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

//importar as rotas
import routerUsuario from "./Routes/UsuarioRoutes.js";
import routerEcoponto from "./Routes/EcopontoRoutes.js";
import routerLixeira from "./Routes/LixeiraRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.disable("x-powered-by");
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

//incluir rotas
app.use("/usuario", routerUsuario);
app.use("/ecoponto", routerEcoponto);
app.use("/lixeira", routerLixeira);

//Swagger (lê o arquivo gerado por "npm run swagger")
try {
    const swaggerFile = JSON.parse(fs.readFileSync(path.resolve("swagger_output.json"), "utf-8"));
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
} catch {
    console.warn('swagger_output.json não encontrado. Execute "npm run swagger" para gerá-lo.');
}

//rota inexistente e erros (ex.: JSON malformado) sempre respondem em JSON
app.use((req, res) => {
    res.status(404).json({ message: "Rota não encontrada" });
});
const tratarErros: ErrorRequestHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);
    const status = err?.status === 400 || err?.type === "entity.parse.failed" ? 400 : 500;
    if (status === 500) console.error(err);
    res.status(status).json({ message: status === 400 ? "Requisição inválida" : "Erro interno do servidor" });
};
app.use(tratarErros);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Swagger disponível em http://localhost:${PORT}/docs`);
});
