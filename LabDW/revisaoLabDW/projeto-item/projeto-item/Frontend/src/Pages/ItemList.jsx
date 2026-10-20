// ==================== ItemList.jsx — LISTA (loading/error/dados, busca, filtro, excluir) ====================

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getItens, deleteItem, msgErro } from "../API/Api.jsx";
import ItemCard from "../Components/ItemCard.jsx";
import GraficoSituacao from "../Components/GraficoSituacao.jsx";

export default function ItemList({ usuarioLogado }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState("Todas");

  const carregar = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getItens();          // ou getItens({ busca, situacao }) para filtrar no servidor
      setItens(res.data.itens || []);
    } catch (err) {
      setError(msgErro(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  // troca só o item alterado, sem refazer o GET
  const handleUpdate = (atualizado) =>
    setItens((prev) => prev.map((i) => (i._id === atualizado._id ? atualizado : i)));

  // remove do estado depois de o backend confirmar
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir?")) return;
    try {
      await deleteItem(id);
      setItens((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert("Erro ao excluir: " + msgErro(err));
    }
  };

  // filtro no front (dado derivado: calculado a cada render, sem estado extra)
  const filtrados = useMemo(
    () =>
      itens.filter(
        (i) =>
          (filtroSituacao === "Todas" || i.situacao === filtroSituacao) &&
          i.titulo.toLowerCase().includes(busca.toLowerCase())
      ),
    [itens, busca, filtroSituacao]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h2 className="text-2xl font-bold">Meus Itens</h2>
        <Link to="/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">+ Novo</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por título..."
          className="flex-1 border rounded-lg px-3 py-2" />
        <select value={filtroSituacao} onChange={(e) => setFiltroSituacao(e.target.value)}
          className="border rounded-lg px-3 py-2">
          <option>Todas</option>
          <option>Pendente</option>
          <option>Finalizada</option>
          <option>Cancelada</option>
        </select>
      </div>

      {loading && <p className="text-center py-8 text-gray-500">Carregando...</p>}
      {error && !loading && <p className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</p>}
      {!loading && !error && <GraficoSituacao itens={itens} />}
      {!loading && !error && (
        <div className="space-y-3">
          {filtrados.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nenhum item encontrado!</p>
          ) : (
            filtrados.map((item) => (
              <ItemCard key={item._id} item={item} usuarioLogado={usuarioLogado}
                onUpdate={handleUpdate} onDelete={handleDelete} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
