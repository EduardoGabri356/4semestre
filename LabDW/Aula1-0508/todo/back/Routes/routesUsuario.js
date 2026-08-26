import { Router } from "express";
import usuarioController from "../controllers/usuarioController.js"

const routesUsuario = Router();

routesUsuario.post("/createUsuario", usuarioController.Create);

export default routesUsuario;