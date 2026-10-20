// ==================== useFetch — hook genérico de busca de dados (opcional) ====================

import { useState, useEffect } from "react";

// Uso: const { dados, loading, error, recarregar } = useFetch(() => getItens(), []);
export function useFetch(funcaoApi, dependencias = []) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let ativo = true;                         // evita atualizar estado de componente desmontado
    setLoading(true);
    funcaoApi()
      .then((res) => ativo && setDados(res.data))
      .catch((err) => ativo && setError(err.response?.data?.message || err.message))
      .finally(() => ativo && setLoading(false));
    return () => { ativo = false; };
  }, [...dependencias, tick]);

  return { dados, loading, error, recarregar: () => setTick((t) => t + 1) };
}
