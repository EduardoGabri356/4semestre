// ==================== ResetPassword.jsx — REDEFINIR SENHA ====================
// Abre pelo link do e-mail: /reset-password?token=XXXX
// useSearchParams lê a query string e preenche o campo do token automaticamente.
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { reset, msgErro } from "../API/Api.jsx";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      alert("As senhas não coincidem");
      return;
    }
    setSaving(true);
    try {
      await reset({ token, novaSenha }); // POST /resetPassword
      alert("Senha redefinida com sucesso! Faça login com a nova senha.");
      navigate("/login");
    } catch (error) {
      alert("Erro ao redefinir senha: " + msgErro(error));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100";

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6">Redefinir senha</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Token de recuperação</label>
          <input required disabled={saving} value={token} onChange={(e) => setToken(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nova senha</label>
          <input type="password" required disabled={saving} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirmar nova senha</label>
          <input type="password" required disabled={saving} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" disabled={saving} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
          {saving ? "Salvando..." : "Redefinir senha"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link to="/login" className="text-blue-600">Voltar para o login</Link>
      </div>
    </div>
  );
}
