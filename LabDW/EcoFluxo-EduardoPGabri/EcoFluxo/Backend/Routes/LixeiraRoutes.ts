import { Router } from "express";
//middlewares desativados para testes. Depois, importar autenticacaoToken e autorizacaoPerfil
//de "../Middlewares/seguranca.js" e incluir antes dos controllers
import LixeiraController from "../Controllers/LixeiraController.js";

const routerLixeira = Router();
routerLixeira.post("/cadastrar", LixeiraController.Cadastrar);
routerLixeira.get("/buscarTodos", LixeiraController.buscarTodos);
routerLixeira.get("/ecoponto/:ecoponto_id", LixeiraController.buscarPorEcoponto);

export default routerLixeira;
