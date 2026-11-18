import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setUnauthorizedHandler } from "../lib/api.js";

const CHAVE = "ecofluxo:usuario";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // o cookie "jwt" é httpOnly (o JS não lê), então guardamos só os dados do usuário
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CHAVE));
    } catch {
      return null;
    }
  });
  const [aviso, setAviso] = useState("");

  const entrar = useCallback((dados) => {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
    setUsuario(dados);
    setAviso("");
  }, []);

  const limpar = useCallback((mensagem = "") => {
    localStorage.removeItem(CHAVE);
    setUsuario(null);
    setAviso(mensagem);
  }, []);

  const sair = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* mesmo se falhar, encerramos a sessão local */
    }
    limpar();
  }, [limpar]);

  useEffect(() => {
    setUnauthorizedHandler(() => limpar("Sua sessão expirou. Entre novamente."));
  }, [limpar]);

  const valor = useMemo(() => ({ usuario, aviso, entrar, sair }), [usuario, aviso, entrar, sair]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
