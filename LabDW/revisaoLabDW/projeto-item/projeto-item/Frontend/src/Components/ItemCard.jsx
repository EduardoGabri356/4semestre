// ==================== ItemCard.jsx — UM ITEM DA LISTA (comunica com o pai por callbacks) ====================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import ChatModal from "./ChatModal.jsx";
import { updateSituacaoItem, msgErro } from "../API/Api.jsx";

// mapa situação -> classes (evita if/else no JSX)
const estiloSituacao = {
  Pendente: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Finalizada: "bg-green-50 text-green-700 border-green-200",
  Cancelada: "bg-red-50 text-red-700 border-red-200",
};

export default function ItemCard({ item, usuarioLogado, onUpdate, onDelete }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const mudarSituacao = async (novaSituacao) => {
    if (novaSituacao === "Cancelada" && !window.confirm("Deseja realmente cancelar?")) return;
    setSaving(true);
    try {
      const resposta = await updateSituacaoItem(item._id, novaSituacao);
      onUpdate?.(resposta.data.item);        // ?. = só chama se o callback existir
    } catch (error) {
      alert("Erro ao atualizar: " + msgErro(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded hover:shadow-sm">
        <div>
          <div className="font-medium">{item.titulo}</div>
          <div className="text-sm text-gray-600">{item.descricao}</div>
          {/* timeZone UTC evita mostrar o dia anterior no Brasil */}
          <div className="text-sm">Data limite: {new Date(item.dataLimite).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</div>
          <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold border rounded-full ${estiloSituacao[item.situacao] || ""}`}>
            {item.situacao}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {item.situacao === "Pendente" && (
            <>
              <button onClick={() => mudarSituacao("Finalizada")} disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50">
                Finalizar
              </button>
              <button onClick={() => mudarSituacao("Cancelada")} disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg disabled:opacity-50">
                Cancelar
              </button>
            </>
          )}
          <Link to={`/edit/${item._id}`} className="px-3 py-1.5 text-xs font-semibold border rounded-lg hover:bg-gray-50">Editar</Link>
          <button onClick={() => onDelete?.(item._id)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-700 hover:bg-gray-800 rounded-lg">
            Excluir
          </button>
          <button onClick={() => setIsChatOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg">
            💬 Chat
          </button>
        </div>
      </div>

      {isChatOpen && <ChatModal item={item} usuarioLogado={usuarioLogado} onClose={() => setIsChatOpen(false)} />}
    </>
  );
}
