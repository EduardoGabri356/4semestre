// ==================== ItemForm.jsx — CRIAR E EDITAR (mesma tela) ====================
// useParams decide o modo: /new (sem id) = criar | /edit/:id = editar.
// Também aceita comandos de voz ("título ...", "descrição ...", "data amanhã").
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createItem, updateItem, getItemById, getUsers, msgErro } from "../API/Api.jsx";
import { useVoiceRecognition } from "../Hooks/useVoiceRecognition.js";

export default function ItemForm() {
  const { id } = useParams(); // existe em /edit/:id; undefined em /new
  const editando = Boolean(id);
  const navigate = useNavigate();

  // Um estado por campo (formulário controlado)
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataLimite, setDataLimite] = useState("");
  const [participam, setParticipam] = useState([]); // só os _id marcados
  const [usuarios, setUsuarios] = useState([]); // lista exibida nas checkboxes
  const [saving, setSaving] = useState(false);

  // Hook de voz: encapsula a API do navegador (Chrome/Edge)
  const { textoOuvido, setTextoOuvido, ouvindo, iniciarEscuta, processarComandoVoz, suportado } =
    useVoiceRecognition();

  // Toda vez que o hook captura uma fala, interpreta o comando e preenche o campo
  useEffect(() => {
    processarComandoVoz(textoOuvido, setTitulo, setDescricao, setDataLimite);
    setTextoOuvido(""); // limpa para não reprocessar a mesma frase
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textoOuvido]);

  // Carrega os participantes possíveis (e o item, se estiver editando)
  useEffect(() => {
    async function carregar() {
      try {
        const resUsuarios = await getUsers();
        setUsuarios(resUsuarios.data.usuarios || []);
        if (editando) {
          const res = await getItemById(id);
          const item = res.data.item;
          setTitulo(item.titulo);
          setDescricao(item.descricao);
          setDataLimite(item.dataLimite.slice(0, 10)); // "YYYY-MM-DD" é o formato do input date
          setParticipam((item.participam || []).map((u) => u._id)); // o populate trouxe objetos
        }
      } catch (error) {
        alert("Erro ao carregar: " + msgErro(error));
      }
    }
    carregar();
  }, [id, editando]);

  // Liga/desliga um id no array. Sempre cria um array NOVO (nunca altere o estado direto).
  const handleCheckboxChange = (userId) =>
    setParticipam((prev) => (prev.includes(userId) ? prev.filter((x) => x !== userId) : [...prev, userId]));

  const handleSubmit = async (e) => {
    e.preventDefault(); // não recarrega a página
    setSaving(true);
    try {
      const payload = { titulo, descricao, dataLimite, participam };
      if (editando) await updateItem(id, payload); // PUT /item/update/:id
      else await createItem(payload); // POST /item/create
      navigate("/itens"); // a lista recarrega e mostra a mudança
    } catch (error) {
      alert("Erro ao salvar: " + msgErro(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{editando ? "Editar Item" : "Novo Item"}</h2>
        {suportado && (
          <button
            type="button"
            onClick={iniciarEscuta}
            className={`px-4 py-2 rounded-lg text-white text-sm cursor-pointer ${
              ouvindo ? "bg-red-500 animate-pulse" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            🎙️ {ouvindo ? "Clique para parar" : "Preencher por voz"}
          </button>
        )}
      </div>

      {suportado && (
        <p className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-800">
          Comandos: "título ...", "descrição ...", "data amanhã / hoje / daqui a 3 dias".
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea required value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data limite</label>
          <input required type="date" value={dataLimite} onChange={(e) => setDataLimite(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Participantes</label>
          <div className="max-h-40 overflow-y-auto border rounded p-3 space-y-2 bg-gray-50">
            {usuarios.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum outro usuário disponível.</p>
            ) : (
              usuarios.map((user) => (
                <label key={user._id} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={participam.includes(user._id)} onChange={() => handleCheckboxChange(user._id)} />
                  <span className="text-sm">{user.nome}</span>
                </label>
              ))
            )}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 cursor-pointer">
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded hover:bg-gray-50 cursor-pointer">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
