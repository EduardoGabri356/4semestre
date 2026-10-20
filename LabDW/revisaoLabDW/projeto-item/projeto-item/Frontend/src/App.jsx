// ==================== App.jsx — SESSÃO, MENU E ROTAS ====================
// Responsabilidades:
//  1) Descobrir se há usuário logado (GET /me) ao abrir o site.
//  2) Proteger telas: sem login redireciona para /login (<Navigate>).
//  3) Passar usuarioLogado para quem precisa (ItemList -> ItemCard -> ChatModal).
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { logout, getProfile } from "./API/Api.jsx";
import Login from "./Pages/Login.jsx";
import Cadastro from "./Pages/Cadastro.jsx";
import ForgotPassword from "./Pages/ForgotPassword.jsx";
import ResetPassword from "./Pages/ResetPassword.jsx";
import ItemList from "./Pages/ItemList.jsx";
import ItemForm from "./Pages/ItemForm.jsx";

// Rota protegida: sem login vai para /login.
// Uso: <Route path="x" element={<Privada ok={isAuthenticated}><Tela /></Privada>} />
function Privada({ ok, children }) {
  return ok ? children : <Navigate to="/login" replace />;
}

// Rota só para visitantes: quem já está logado vai direto para a lista.
function Publica({ ok, children }) {
  return ok ? <Navigate to="/itens" replace /> : children;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loading, setLoading] = useState(true); // evita "piscar" a tela de login antes do /me responder
  const navigate = useNavigate();

  // Pergunta ao backend se o cookie é válido (o cookie vai sozinho por causa do withCredentials)
  const checkUserSession = async () => {
    try {
      const response = await getProfile();
      setIsAuthenticated(true);
      setUsuarioLogado(response.data.usuario);
    } catch (error) {
      setIsAuthenticated(false); // 401/403 = não logado (é normal ao abrir o site sem login)
      setUsuarioLogado(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession(); // [] = executa uma vez, ao abrir a página
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // no finally: a tela sai do estado logado mesmo se a API falhar
      setIsAuthenticated(false);
      setUsuarioLogado(null);
      navigate("/login");
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <Link to={isAuthenticated ? "/itens" : "/login"} className="text-xl font-semibold">
          Projeto Item
        </Link>
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Olá, {usuarioLogado?.nome}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
            >
              Sair
            </button>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/itens" : "/login"} replace />} />

          {/* Públicas (só visitantes) */}
          <Route
            path="/login"
            element={
              <Publica ok={isAuthenticated}>
                <Login
                  onLoginSuccess={async () => {
                    await checkUserSession(); // recarrega a sessão ANTES de navegar
                    navigate("/itens");
                  }}
                />
              </Publica>
            }
          />
          <Route path="/register" element={<Publica ok={isAuthenticated}><Cadastro /></Publica>} />
          <Route path="/forgot" element={<Publica ok={isAuthenticated}><ForgotPassword /></Publica>} />
          {/* O link do e-mail abre /reset-password?token=XXXX, com ou sem login */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Privadas */}
          <Route
            path="/itens"
            element={<Privada ok={isAuthenticated}><ItemList usuarioLogado={usuarioLogado} /></Privada>}
          />
          <Route path="/new" element={<Privada ok={isAuthenticated}><ItemForm /></Privada>} />
          {/* :id é lido no ItemForm com useParams() */}
          <Route path="/edit/:id" element={<Privada ok={isAuthenticated}><ItemForm /></Privada>} />

          <Route path="*" element={<p>Página não encontrada</p>} />
        </Routes>
      </main>
    </div>
  );
}
