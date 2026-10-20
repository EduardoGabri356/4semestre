// ==================== ForgotPassword.jsx — "ESQUECI A SENHA" ====================
// Envia o e-mail para POST /forgotPassword e mostra a mensagem genérica do backend
// (o backend responde igual exista ou não o e-mail, para não revelar quem tem conta).
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgot, msgErro } from "../API/Api.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem("");
    try {
      const resposta = await forgot({ email });
      setMensagem(resposta.data.message);
    } catch (error) {
      alert("Erro ao solicitar recuperação: " + msgErro(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6">Esqueci minha senha</h2>

      {/* Renderização condicional: com mensagem, o formulário some */}
      {!mensagem ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">{mensagem}</p>
      )}

      <div className="mt-4 text-center text-sm">
        <Link to="/login" className="text-blue-600">Voltar para o login</Link>
      </div>
    </div>
  );
}
