// ==================== Login.jsx — formulário controlado (modelo para os outros formulários) ====================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { login, msgErro } from "../API/Api.jsx";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();                  // não recarrega a página
    setLoading(true);
    try {
      await login({ email, senha });     // o navegador grava o cookie sozinho
      if (onLoginSuccess) await onLoginSuccess();
    } catch (error) {
      alert("Erro ao efetuar login: " + msgErro(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6">Entrar</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input type="email" required disabled={loading} value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input type="password" required disabled={loading} value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
          {loading ? "Carregando..." : "Entrar"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link to="/forgot" className="text-blue-600">Esqueci a senha</Link>
        <span className="mx-2 text-gray-400">|</span>
        <Link to="/register" className="text-blue-600">Criar conta</Link>
      </div>
    </div>
  );
}
