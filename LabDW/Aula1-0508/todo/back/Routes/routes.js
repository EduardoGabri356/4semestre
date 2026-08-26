import { Router } from "express";
import TarefaController from "../controllers/TarefaController.js";

const routes = Router();

routes.post("/create", TarefaController.Create);
routes.get("/getAll", TarefaController.GetAll);

export default routes;