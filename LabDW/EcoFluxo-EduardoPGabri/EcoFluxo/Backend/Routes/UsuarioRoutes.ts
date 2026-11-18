import { Router } from "express";
import UsuarioController from "../Controllers/UsuarioController.js";

const routerUsuario = Router();
routerUsuario.post("/create", UsuarioController.Create);
routerUsuario.post("/login", UsuarioController.Login);
routerUsuario.post("/verify-2fa", UsuarioController.Verify2FA);
routerUsuario.post("/logout", UsuarioController.Logout);

export default routerUsuario;
