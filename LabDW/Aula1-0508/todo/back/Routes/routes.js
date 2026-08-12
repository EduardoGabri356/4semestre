import { Routes } from "express";
import tarefaController from "../controllers/TarefaController";

// Instancia um novo objeto do módulo de rotas
const routes = new Routes();

routes.post("/create/", TarefaController.create);
routes.post("/getAll/", TarefaController.getAll);

export default routes;