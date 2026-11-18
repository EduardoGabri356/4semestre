import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { NOME_COOKIE, opcoesCookie } from "../lib/cookies.js";

const segredo = process.env.JWT_SECRET;
if (!segredo) {
    throw new Error("JWT_SECRET não está definido no .env");
}
//exportado para o controller assinar os tokens com o mesmo segredo que o middleware verifica
export const JWT_SECRET: string = segredo;

export interface UsuarioPayload {
    id: number;
    nome: string;
    email: string;
    perfil: "MORADOR" | "GESTOR";
}
export interface AuthRequest extends Request {
    user?: UsuarioPayload;
}

//autenticação: exige o cookie "jwt" válido (401 = não autenticado / sessão inválida ou expirada)
export const autenticacaoToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.[NOME_COOKIE];
    if (!token) {
        return res.status(401).json({ message: "Acesso negado: faça login para continuar" });
    }
    try {
        req.user = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as UsuarioPayload;
        next();
    } catch {
        //token inválido ou expirado: limpa o cookie (mesmas opções usadas ao criá-lo)
        res.clearCookie(NOME_COOKIE, opcoesCookie);
        return res.status(401).json({ message: "Sessão inválida ou expirada" });
    }
};

//autorização: verifica o perfil do usuário autenticado (403 = autenticado, mas sem permissão)
export const autorizacaoPerfil = (perfilPermitido: "MORADOR" | "GESTOR") => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Não está autenticado" });
        }
        if (req.user.perfil !== perfilPermitido) {
            return res.status(403).json({ message: "Você não tem permissão para esta ação" });
        }
        next();
    };
};
