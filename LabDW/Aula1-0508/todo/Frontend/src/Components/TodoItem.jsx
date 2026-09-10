import React, { useState } from "react";
import TaskChatModal from "./TaskChatModal";

export default function TodoItem({ todo, usuarioLogado }) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded hover:shadow-sm">
                <div>
                    <div className="font-medium">{todo.titulo}</div>
                    <div className="text-sm text-gray-600">{todo.descricao}</div>
                    <div className="text-sm">Data Limite: {new Date(todo.dataLimite).toLocaleDateString()}</div>
                    <div className="text-sm">Situação: {todo.situacao}</div>
                </div>

                {/* Botão para abrir o modal de Chat */}
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer ml-auto"
                    title="Abrir chat da tarefa"
                >
                    <span>💬</span>
                    <span>Chat</span>
                </button>
            </div>

            {/* Modal do Chat acionado pelo estado */}
            {isChatOpen && (
                <TaskChatModal
                    tarefa={todo}
                    usuarioLogado={usuarioLogado}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </>
    );
}