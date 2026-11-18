import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, ShieldCheck } from "lucide-react";
import Logo from "../components/Logo.jsx";
import Field from "../components/Field.jsx";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { usuario, entrar, aviso } = useAuth();
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState("credenciais"); // credenciais | codigo
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [info, setInfo] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/ecopontos" replace />;

  async function enviarCredenciais(e) {
    e.preventDefault();
    setErro("");
    if (!email.trim() || !senha) {
      setErro("Informe e-mail e senha.");
      return;
    }
    setEnviando(true);
    try {
      const resposta = await api.login(email.trim(), senha);
      // backend com verificação em duas etapas desligada: já devolve o usuário logado
      if (resposta.usuario) {
        entrar(resposta.usuario);
        navigate("/ecopontos", { replace: true });
        return;
      }
      setCodigo("");
      setInfo("");
      setEtapa("codigo");
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarCodigo(e) {
    e.preventDefault();
    setErro("");
    if (codigo.length !== 6) {
      setErro("O código tem 6 dígitos.");
      return;
    }
    setEnviando(true);
    try {
      const resposta = await api.verify2FA(email.trim(), codigo);
      entrar(resposta.usuario);
      navigate("/ecopontos", { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function reenviar() {
    setErro("");
    setInfo("");
    setEnviando(true);
    try {
      await api.login(email.trim(), senha);
      setInfo("Enviamos um novo código para o seu e-mail.");
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <section className="login__brand" aria-label="EcoFluxo">
        <Logo size={56} tone="inverse" />
        <div className="login__brand-text">
          <h2>Ecopontos e lixeiras sob controle.</h2>
          <p>Acompanhe os pontos de coleta e o nível de cada lixeira em um só lugar.</p>
        </div>
        <svg className="login__waves" viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 110 C 120 50, 220 170, 340 110 S 540 50, 600 90 V300 H0Z" fill="#2BC8B5" />
          <path d="M0 175 C 140 120, 240 230, 360 175 S 560 135, 600 165 V300 H0Z" fill="#E5E4E2" opacity="0.16" />
          <path d="M0 240 C 140 200, 260 285, 380 240 S 560 215, 600 232 V300 H0Z" fill="#000" opacity="0.14" />
        </svg>
      </section>

      <section className="login__panel">
        <div className="login__card">
          {etapa === "credenciais" ? (
            <form onSubmit={enviarCredenciais} className="form form--login" noValidate>
              <div>
                <h1>Entrar</h1>
                <p className="muted">Use o e-mail e a senha da sua conta.</p>
              </div>
              {aviso && <p className="alert" role="status">{aviso}</p>}
              {erro && <p className="alert alert--error" role="alert">{erro}</p>}
              <Field label="E-mail">
                <input
                  className="input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </Field>
              <Field label="Senha">
                <input
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </Field>
              <button type="submit" className="btn btn--primary btn--block" disabled={enviando}>
                <LogIn size={18} aria-hidden="true" />
                {enviando ? "Entrando..." : "Fazer login"}
              </button>
            </form>
          ) : (
            <form onSubmit={confirmarCodigo} className="form form--login" noValidate>
              <div>
                <h1>Verificação em duas etapas</h1>
                <p className="muted">
                  Enviamos um código de 6 dígitos para <strong>{email.trim()}</strong>. Ele vale por 10 minutos.
                </p>
              </div>
              {info && <p className="alert" role="status">{info}</p>}
              {erro && <p className="alert alert--error" role="alert">{erro}</p>}
              <Field label="Código de verificação">
                <input
                  className="input input--code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                />
              </Field>
              <button type="submit" className="btn btn--primary btn--block" disabled={enviando}>
                <ShieldCheck size={18} aria-hidden="true" />
                {enviando ? "Verificando..." : "Confirmar código"}
              </button>
              <div className="form-actions form-actions--split">
                <button type="button" className="btn btn--ghost" onClick={() => { setEtapa("credenciais"); setErro(""); }}>
                  <ArrowLeft size={18} aria-hidden="true" />
                  Voltar
                </button>
                <button type="button" className="btn btn--ghost" onClick={reenviar} disabled={enviando}>
                  Enviar novo código
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}