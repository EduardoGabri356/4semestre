// ==================== Rotas de Tarefa ====================
// Rota = verbo HTTP + caminho + (middlewares opcionais) + método do Controller.
// URL final = /ToDo + caminho (prefixo definido no index.js).

import {Router} from "express";
import TarefaController from "../Controllers/TarefaController.js";

const routesTarefa = new Router();

// POST /ToDo/create
routesTarefa.post("/create", TarefaController.Create);
// GET /ToDo/getAll
routesTarefa.get("/getAll", TarefaController.getAll);
// PATCH /ToDo/updateSituacao/:id  (":id" vira req.params.id; PATCH = alteração parcial)
// NOTA DE REVISÃO: as rotas de tarefa não usam UserMiddleware (são públicas).
routesTarefa.patch("/updateSituacao/:id", TarefaController.updateSituacao);

export default routesTarefa;
