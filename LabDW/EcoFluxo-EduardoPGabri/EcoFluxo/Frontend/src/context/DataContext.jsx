import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [ecopontos, setEcopontos] = useState([]);
  const [lixeiras, setLixeiras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const [e, l] = await Promise.all([api.getEcopontos(), api.getLixeiras()]);
      setEcopontos(e);
      setLixeiras(l);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const ecopontoPorId = useMemo(() => new Map(ecopontos.map((e) => [e.id, e])), [ecopontos]);

  const lixeirasPorEcoponto = useMemo(() => {
    const mapa = new Map();
    for (const l of lixeiras) {
      if (!mapa.has(l.ecoponto_id)) mapa.set(l.ecoponto_id, []);
      mapa.get(l.ecoponto_id).push(l);
    }
    return mapa;
  }, [lixeiras]);

  const criarEcoponto = useCallback(async (dados) => {
    const resposta = await api.createEcoponto(dados);
    setEcopontos((atual) => [...atual, resposta.ecoponto]);
    return resposta.ecoponto;
  }, []);

  const criarLixeira = useCallback(async (dados) => {
    const resposta = await api.createLixeira(dados);
    setLixeiras((atual) => [...atual, resposta.lixeira]);
    return resposta.lixeira;
  }, []);

  const valor = useMemo(
    () => ({ ecopontos, lixeiras, ecopontoPorId, lixeirasPorEcoponto, carregando, erro, carregar, criarEcoponto, criarLixeira }),
    [ecopontos, lixeiras, ecopontoPorId, lixeirasPorEcoponto, carregando, erro, carregar, criarEcoponto, criarLixeira]
  );
  return <DataContext.Provider value={valor}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
