import express from "express";
import cors from "cors";
import routes from "./Routes/routes.js";
// incluir as rotas
const app = new express();
// comunicação entre front e back, usar json
app.use(express.json());
app.use(cors({
    Credential: true,
    origin: "http://localhost:3000"
}))
// ligar express com as rotas
app.use("/docs", swaggerUI.serve, saggerUI.setup(swaggerDocument));
app.use("/todo", routes);
app.listen(5000);