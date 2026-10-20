// ==================== ChatModal.jsx — CHAT EM TEMPO REAL (REST para histórico + Socket.IO) ====================

import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getHistory } from "../API/Api.jsx";

const SOCKET_URL = "http://localhost:5000";

export default function ChatModal({ item, usuarioLogado, onClose }) {
  const [mensagens, setMensagens] = useState([]);
  const [novoTexto, setNovoTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);       // guarda o socket entre renders sem re-renderizar
  const fimRef = useRef(null);          // âncora para autoscroll

  useEffect(() => {
    // 1) histórico por HTTP (uma vez)
    async function carregarHistorico() {
      try {
        const res = await getHistory(item._id);
        setMensagens(res.data.mensagens || []);
      } catch (error) {
        console.log("Erro ao carregar histórico", error);
      } finally {
        setLoading(false);
      }
    }
    carregarHistorico();

    // 2) conexão em tempo real
    socketRef.current = io(SOCKET_URL, { withCredentials: true });  // envia o cookie (JWT) no handshake
    socketRef.current.emit("join_item", item._id);                  // entra na sala do item
    socketRef.current.on("receive_message", (msg) => setMensagens((prev) => [...prev, msg]));
    socketRef.current.on("chat_error", (e) => alert(e.message));

    // 3) CLEANUP: ao fechar o modal sai da sala e desconecta (evita sockets duplicados)
    return () => {
      socketRef.current.emit("leave_item", item._id);
      socketRef.current.disconnect();
    };
  }, [item._id]);

  // rola para o fim quando chega mensagem
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!novoTexto.trim()) return;
    // o remetente NÃO vai: o servidor usa o JWT. Não adicionamos localmente: esperamos o receive_message.
    socketRef.current.emit("send_message", { itemId: item._id, texto: novoTexto });
    setNovoTexto("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col h-[550px] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold">{item.titulo}</h3>
          <button onClick={onClose} className="text-xl font-bold text-gray-500 cursor-pointer">✕</button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {loading ? (
            <p className="text-center text-sm text-gray-500">Carregando histórico...</p>
          ) : mensagens.length === 0 ? (
            <p className="text-center text-sm text-gray-400">Nenhuma mensagem ainda.</p>
          ) : (
            mensagens.map((msg, index) => {
              const eMeu = (msg.remetente?._id || msg.remetente) === (usuarioLogado._id || usuarioLogado.id);
              return (
                <div key={msg._id || index} className={`flex flex-col ${eMeu ? "items-end" : "items-start"}`}>
                  <span className="text-[10px] text-gray-400">{msg.remetente?.nome || "Usuário"}</span>
                  <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${eMeu ? "bg-blue-600 text-white" : "bg-white border text-gray-800"}`}>
                    {msg.texto}
                  </div>
                </div>
              );
            })
          )}
          <div ref={fimRef} />
        </div>

        <form onSubmit={handleEnviar} className="p-3 border-t flex gap-2">
          <input value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)} placeholder="Digite sua mensagem..."
            className="flex-1 border rounded-xl px-4 py-2 text-sm" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl">Enviar</button>
        </form>
      </div>
    </div>
  );
}
