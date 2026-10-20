// ==================== Rotas de Item ==================== (URL final = /App + caminho)
// Rotas fixas (/resumo) ficam ANTES das rotas com :id.

import { Router } from "express";
import ItemController from "../Controllers/ItemController.js";
import UserMiddleware from "../Middleware/UserMiddleware.js";

const routesItem = new Router();

routesItem.post("/item/create", UserMiddleware, ItemController.Create);
routesItem.get("/item/getAll", UserMiddleware, ItemController.getAll);
routesItem.get("/item/resumo", UserMiddleware, ItemController.Resumo);          // fixas antes das com :id
routesItem.get("/item/getById/:id", UserMiddleware, ItemController.getById);
routesItem.put("/item/update/:id", UserMiddleware, ItemController.Update);
routesItem.patch("/item/updateSituacao/:id", UserMiddleware, ItemController.updateSituacao);
routesItem.patch("/item/finalizarTodos", UserMiddleware, ItemController.finalizarTodos);
routesItem.delete("/item/delete/:id", UserMiddleware, ItemController.Delete);

export default routesItem;
