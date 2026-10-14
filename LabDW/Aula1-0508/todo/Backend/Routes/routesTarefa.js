import {Router} from "express";
import TarefaController from "../Controllers/TarefaController.js";

const routesTarefa = new Router();

routesTarefa.post("/create", TarefaController.Create);
routesTarefa.get("/getAll", TarefaController.getAll);
routesTarefa.patch("/updateSituacao/:id", TarefaController.updateSituacao);

export default routesTarefa;
