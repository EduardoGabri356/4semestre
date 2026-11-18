import { useState } from "react";
import { Plus } from "lucide-react";
import Field from "./Field.jsx";
import { useData } from "../context/DataContext.jsx";

const VAZIO = {
  nome: "",
  latitude: "",
  longitude: "",
  descricao: "",
  cep: "",
  numero: "",
  logradouro: "",
  bairro: "",
  cidade: "",
  uf: "",
};

const numero = (v) => Number(String(v).trim().replace(",", "."));

function validar(f) {
  const e = {};
  if (!f.nome.trim()) e.nome = "Informe o nome do ecoponto.";
  const lat = numero(f.latitude);
  if (!f.latitude.trim() || !Number.isFinite(lat) || lat < -90 || lat > 90) e.latitude = "Use um número entre -90 e 90.";
  const lng = numero(f.longitude);
  if (!f.longitude.trim() || !Number.isFinite(lng) || lng < -180 || lng > 180) e.longitude = "Use um número entre -180 e 180.";
  if (f.cep.trim() && f.cep.replace(/\D/g, "").length !== 8) e.cep = "O CEP deve ter 8 dígitos.";
  if (f.uf.trim() && !/^[A-Za-z]{2}$/.test(f.uf.trim())) e.uf = "Use a sigla com 2 letras.";
  return e;
}

export default function EcopontoForm({ onCriado }) {
  const { criarEcoponto } = useData();
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState("");
  const [enviando, setEnviando] = useState(false);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  // preenche o endereço pelo CEP (ViaCEP); se falhar, o usuário digita manualmente
  async function buscarCep() {
    const digitos = form.cep.replace(/\D/g, "");
    if (digitos.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
      const d = await r.json();
      if (d.erro) return;
      setForm((f) => ({
        ...f,
        logradouro: f.logradouro || d.logradouro || "",
        bairro: f.bairro || d.bairro || "",
        cidade: f.cidade || d.localidade || "",
        uf: f.uf || d.uf || "",
      }));
    } catch {
      /* sem internet ou serviço fora do ar */
    }
  }

  async function enviar(e) {
    e.preventDefault();
    setErroApi("");
    const e2 = validar(form);
    setErros(e2);
    if (Object.keys(e2).length) return;

    setEnviando(true);
    try {
      const criado = await criarEcoponto({
        ...form,
        nome: form.nome.trim(),
        latitude: String(numero(form.latitude)),
        longitude: String(numero(form.longitude)),
        uf: form.uf.trim().toUpperCase(),
      });
      setForm(VAZIO);
      onCriado(criado);
    } catch (err) {
      setErroApi(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="form" onSubmit={enviar} noValidate>
      {erroApi && (
        <p className="alert alert--error" role="alert">
          {erroApi}
        </p>
      )}
      <Field label="Nome" erro={erros.nome}>
        <input className="input" value={form.nome} onChange={mudar("nome")} placeholder="Ex.: Ecoponto Praça Central" />
      </Field>
      <div className="form-row">
        <Field label="Latitude" erro={erros.latitude}>
          <input className="input" inputMode="decimal" value={form.latitude} onChange={mudar("latitude")} placeholder="-22.2965" />
        </Field>
        <Field label="Longitude" erro={erros.longitude}>
          <input className="input" inputMode="decimal" value={form.longitude} onChange={mudar("longitude")} placeholder="-48.5584" />
        </Field>
      </div>
      <Field label="Descrição (opcional)">
        <textarea className="input input--area" rows={3} value={form.descricao} onChange={mudar("descricao")} />
      </Field>
      <div className="form-row">
        <Field label="CEP (opcional)" erro={erros.cep}>
          <input className="input" inputMode="numeric" value={form.cep} onChange={mudar("cep")} onBlur={buscarCep} placeholder="00000-000" />
        </Field>
        <Field label="Número">
          <input className="input" value={form.numero} onChange={mudar("numero")} />
        </Field>
      </div>
      <Field label="Logradouro">
        <input className="input" value={form.logradouro} onChange={mudar("logradouro")} />
      </Field>
      <Field label="Bairro">
        <input className="input" value={form.bairro} onChange={mudar("bairro")} />
      </Field>
      <div className="form-row form-row--uf">
        <Field label="Cidade">
          <input className="input" value={form.cidade} onChange={mudar("cidade")} />
        </Field>
        <Field label="UF" erro={erros.uf}>
          <input className="input" maxLength={2} value={form.uf} onChange={mudar("uf")} />
        </Field>
      </div>
      <button type="submit" className="btn btn--primary btn--block" disabled={enviando}>
        <Plus size={18} aria-hidden="true" />
        {enviando ? "Criando..." : "Criar ecoponto"}
      </button>
    </form>
  );
}
