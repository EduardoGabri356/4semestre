// ==================== Cadastro.jsx — CRIAR CONTA ====================
// Valida "confirmar senha" no front (conveniência; a validação oficial é a do backend)
// e envia { nome, email, senha } para POST /createUsuario.
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUser, msgErro } from "../API/Api.jsx";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem");
      return; // interrompe antes de chamar a API
    }
    setSaving(true);
    try {
      await createUser({ nome, email, senha });
      alert("Cadastro realizado com sucesso! Faça login para continuar.");
      navigate("/login");
    } catch (error) {
      alert("Erro ao criar conta: " + msgErro(error));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100";

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6">Criar Conta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input required disabled={saving} value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input type="email" required disabled={saving} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input type="password" required disabled={saving} value={senha} onChange={(e) => setSenha(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirmar senha</label>
          <input type="password" required disabled={saving} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" disabled={saving} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
          {saving ? "Criando conta..." : "Criar Conta"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        Já tem conta? <Link to="/login" className="text-blue-600">Entrar</Link>
      </div>
    </div>
  );
}
