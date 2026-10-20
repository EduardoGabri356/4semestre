// ==================== Rotas de Usuário ==================== públicas e privadas (UserMiddleware)

import { Router } from "express";
import UsuarioController from "../Controllers/UsuarioController.js";
import UserMiddleware from "../Middleware/UserMiddleware.js";

const routesUsuario = new Router();

// públicas
routesUsuario.post("/createUsuario", UsuarioController.Create);
routesUsuario.post("/login", UsuarioController.Login);
routesUsuario.post("/logout", UsuarioController.Logout);
routesUsuario.post("/forgotPassword", UsuarioController.ForgotPassword);
routesUsuario.post("/resetPassword", UsuarioController.ResetPassword);
// privadas (passam pelo middleware)
routesUsuario.get("/me", UserMiddleware, UsuarioController.Profile);
routesUsuario.get("/getAllUsers", UserMiddleware, UsuarioController.getAllExceptLogged);
routesUsuario.put("/updateProfile", UserMiddleware, UsuarioController.UpdateProfile);
routesUsuario.patch("/changePassword", UserMiddleware, UsuarioController.ChangePassword);
routesUsuario.delete("/deleteAccount", UserMiddleware, UsuarioController.DeleteAccount);

export default routesUsuario;
