// imports de Rotas
import routesTarefa from "./Routes/routesTarefa.js";
import routesUsuario from "./Routes/routesUsuario.js";

// node modules
import express from "express";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json" };

const app = express();

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use("/todo", routesTarefa);
app.use("/todo", routesUsuario);

app.listen(5000, () => console.log("Servidor rodando na porta 5000"));