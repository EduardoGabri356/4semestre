const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

let aoExpirarSessao = null;
// o AuthContext registra aqui o que fazer quando o backend recusar o cookie (401)
export function setUnauthorizedHandler(fn) {
  aoExpirarSessao = fn;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// publico: rotas de login, onde um 401 significa "credenciais erradas" e não "sessão expirada"
async function request(path, { method = "GET", body, publico = false } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: "include", // envia/recebe o cookie "jwt"
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor. Confira se o backend está rodando.", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* resposta sem corpo JSON */
  }

  if (!res.ok) {
    if (res.status === 401 && !publico && aoExpirarSessao) aoExpirarSessao();
    throw new ApiError(data?.message || "Algo deu errado. Tente novamente.", res.status);
  }
  return data;
}

export const api = {
  login: (email, senha) => request("/usuario/login", { method: "POST", body: { email, senha }, publico: true }),
  verify2FA: (email, codigo) => request("/usuario/verify-2fa", { method: "POST", body: { email, codigo }, publico: true }),
  logout: () => request("/usuario/logout", { method: "POST" }),
  getEcopontos: () => request("/ecoponto/getEcopontos"),
  createEcoponto: (dados) => request("/ecoponto/createEcoponto", { method: "POST", body: dados }),
  getLixeiras: () => request("/lixeira/buscarTodos"),
  createLixeira: (dados) => request("/lixeira/cadastrar", { method: "POST", body: dados }),
};
