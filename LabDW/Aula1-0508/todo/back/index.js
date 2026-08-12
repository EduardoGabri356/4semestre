import express from "express";
import cors from "cors";
// incluir as rotas
const app = new express();
// comunicação entre front e back, usar json
app.use(express.json());
app.use(cors({
    Credential: true,
    origin: "http://localhost:3000"
}))
// ligar express com as rotas
app.listen(5000);