import { Router } from "express";
import TarefaController from "../controllers/TarefaController.js";

const routesTarefa = Router();

routesTarefa.post("/create", TarefaController.Create);
routesTarefa.get("/getAll", TarefaController.GetAll);

export default routesTarefa;