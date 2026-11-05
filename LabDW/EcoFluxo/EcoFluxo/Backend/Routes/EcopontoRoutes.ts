import { Router } from 'express';
import { autenticacaoToken, autorizacaoPerfil } from "../Middlewares/seguranca.js";
import EcopontoController from '../Controllers/EcopontoController.js';

const routerEcoponto = Router();
routerEcoponto.post("/createEcoponto", autenticacaoToken, 
    autorizacaoPerfil("GESTOR"), EcopontoController.Create);
//sem middlewares por enquanto para testes. Depois, incluir autenticacaoToken antes do controller
routerEcoponto.get("/getEcopontos", EcopontoController.getEcopontos);


export default routerEcoponto;
