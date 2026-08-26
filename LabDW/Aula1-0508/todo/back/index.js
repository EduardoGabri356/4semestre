import express from "express";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import routes from "./Routes/routes.js";
import swaggerDocument from "./swagger-output.json" with { type: "json" };

const app = express();

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use("/todo", routes);

app.listen(5000, () => console.log("Servidor rodando na porta 5000"));