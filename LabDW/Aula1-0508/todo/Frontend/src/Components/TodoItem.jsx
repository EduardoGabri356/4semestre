import React, { useState } from "react";
import TodoChatModal from "./TodoChatModal.jsx";
import { updateSituacao } from "../API/Todo.jsx";

const estiloSituacao = {
    Pendente: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Finalizada: "bg-green-50 text-green-700 border-green-200",
    Cancelada: "bg-red-50 text-red-700 border-red-200",
};

export default function TodoItem({ todo, usuarioLogado, onUpdate }) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const mudarSituacao = async (novaSituacao) => {
        if (novaSituacao === "Cancelada" && !window.confirm("Deseja realmente cancelar esta tarefa?")) {
            return;
        }
        setSaving(true);
        try {
            const resposta = await updateSituacao(todo._id, novaSituacao);
            onUpdate?.(resposta.data.tarefa);
        } catch (error) {
            alert("Erro ao atualizar a tarefa: " + (error.response?.data?.message || error.message || error));
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded hover:shadow-sm">
                <div>
                    <div className="font-medium">{todo.titulo}</div>
                    <div className="text-sm text-gray-600">{todo.descricao}</div>
                    <div className="text-sm">Data Limite: {new Date(todo.dataLimite).toLocaleDateString()}</div>
                    <div className="text-sm mt-1">
                        Situação:{" "}
                        <span className={`px-2 py-0.5 text-xs font-semibold border rounded-full ${estiloSituacao[todo.situacao] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                            {todo.situacao}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {todo.situacao === "Pendente" && (
                        <>
                            <button
                                onClick={() => mudarSituacao("Finalizada")}
                                disabled={saving}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Finalizar
                            </button>
                            <button
                                onClick={() => mudarSituacao("Cancelada")}
                                disabled={saving}
                                className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                        </>
                    )}

                    {/* Botão para abrir o modal de Chat */}
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                        title="Abrir chat da tarefa"
                    >
                        <span>💬</span>
                        <span>Chat</span>
                    </button>
                </div>
            </div>

            {/* Modal do Chat acionado pelo estado */}
            {isChatOpen && (
                <TodoChatModal
                    tarefa={todo}
                    usuarioLogado={usuarioLogado}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </>
    );
}
