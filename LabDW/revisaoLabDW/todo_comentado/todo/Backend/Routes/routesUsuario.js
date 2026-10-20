// ==================== Rotas de Usuário ====================
// Rotas públicas: cadastro, login, logout, esqueci/redefinir senha.
// Rotas privadas: passam por UserMiddleware antes do Controller.

import {Router} from "express";
import UsuarioController from "../Controllers/UsuarioController.js";
import UserMiddleware from "../Middleware/UserMiddleware.js";
const routesUsuario = new Router();

// POST /ToDo/createUsuario  (pública)
routesUsuario.post("/createUsuario", UsuarioController.Create);
// POST /ToDo/login  (pública) — grava o cookie com o JWT
routesUsuario.post("/login", UsuarioController.Login);
// POST /ToDo/logout  (apaga o cookie)
routesUsuario.post("/logout", UsuarioController.Logout);
// POST /ToDo/resetPassword  (pública; protegida pelo token do e-mail)
routesUsuario.post("/resetPassword", UsuarioController.ResetPassword);
// POST /ToDo/forgotPassword  (pública)
routesUsuario.post("/forgotPassword", UsuarioController.ForgotPassword);
// GET /ToDo/me  (PRIVADA: UserMiddleware roda primeiro e preenche req.user)
routesUsuario.get("/me", UserMiddleware, UsuarioController.Profile);
// GET /ToDo/getAllUsers  (PRIVADA)
routesUsuario.get("/getAllUsers", UserMiddleware, UsuarioController.getAllExceptLogged);

export default routesUsuario;