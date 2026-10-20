// ==================== UserMiddleware — PROTEGE ROTAS PRIVADAS ====================
// Lê o cookie "token", valida o JWT e preenche req.user. Sem cookie = 401 | inválido/expirado = 403.

import jwt from "jsonwebtoken";

// Bloqueia rotas privadas. Sem cookie = 401 | token inválido/expirado = 403
const UserMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Não autenticado." });
        }
        req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, nome, email, perfil }
        return next();
    } catch (error) {
        return res.status(403).json({ message: "Sessão inválida ou expirada." });
    }
};

// (OPCIONAL) exige um perfil. Uso: routes.delete("/delete/:id", UserMiddleware, exigirPerfil("admin"), ...)
export const exigirPerfil = (perfil) => (req, res, next) => {
    if (req.user?.perfil !== perfil) {
        return res.status(403).json({ message: "Sem permissão para esta ação." });
    }
    next();
};

export default UserMiddleware;
