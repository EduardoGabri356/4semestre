//Opções do cookie "jwt", usadas no login (set) e no logout (clear), que precisam ser idênticas.
//- desenvolvimento: front (localhost:5173) e back (localhost:5000) são o mesmo "site", então SameSite=Lax
//  funciona em qualquer navegador, inclusive sem HTTPS.
//- produção: front e back costumam estar em domínios diferentes, então exige SameSite=None + Secure (HTTPS).
const producao = process.env.NODE_ENV === "production";

export const NOME_COOKIE = "jwt";

export const opcoesCookie = {
    httpOnly: true,
    secure: producao,
    sameSite: producao ? ("none" as const) : ("lax" as const),
};
