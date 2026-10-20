// ==================== UserMiddleware — PROTEGE ROTAS PRIVADAS ====================
// Usado em: routesUsuario.js (/me, /getAllUsers) e routesChat.js (/getHistory).
// Fluxo: lê o cookie "token" -> valida o JWT -> coloca o payload em req.user -> next().
// Sem cookie = 401 | token inválido/expirado = 403.
// Padrão de mercado: reutilizável em qualquer projeto com login.

import jwt from "jsonwebtoken";

// Middleware = função (req, res, next).
// next() libera a requisição para o Controller; res.status(...).json(...) a bloqueia aqui.
const UserMiddleware = (req, res, next) => {
    try {
        // Pega o token direto dos cookies da requisição
        const token = req.cookies?.token; // "token" deve ser o mesmo nome usado no res.cookie("token", ...)

        // Se não encontrou o cookie de token
        if (!token) {
            return res.status(401).json({ message: "Não autenticado. Cookie de acesso não encontrado." });
        }

        // Valida a assinatura do token
        // NOTA DE REVISÃO: o segredo padrão escrito no código é inseguro.
        // Sem JWT_SECRET no .env, qualquer pessoa poderia forjar tokens. Ideal: falhar ao iniciar.
        const secret = process.env.JWT_SECRET || "sua_chave_secreta_muito_forte";
        const decoded = jwt.verify(token, secret);

        // Anexa os dados do usuário decodificado na requisição
        // req.user fica disponível no Controller (ex.: req.user.id).
        req.user = decoded;

        // Permite prosseguir para o Controller
        return next();

    } catch (error) {
        return res.status(403).json({ message: "Sessão inválida ou expirada." });
    }
};

export default UserMiddleware;