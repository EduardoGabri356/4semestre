import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import Field from "./Field.jsx";
import { TIPOS } from "../lib/tipos.js";
import { useData } from "../context/DataContext.jsx";

export default function LixeiraForm({ ecoponto, onCriada, onCancelar }) {
  const { criarLixeira } = useData();
  const [form, setForm] = useState({ tipo: "PLASTICO", uuid_sensor: "", volume_max: "", nivel_cheio: "" });
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState("");
  const [enviando, setEnviando] = useState(false);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  function validar() {
    const e = {};
    const vol = Number(form.volume_max);
    const niv = Number(form.nivel_cheio);
    if (!form.uuid_sensor.trim()) e.uuid_sensor = "Informe o UUID do sensor.";
    if (!Number.isInteger(vol) || vol <= 0) e.volume_max = "Use um número inteiro maior que zero.";
    if (!Number.isInteger(niv) || niv <= 0) e.nivel_cheio = "Use um número inteiro maior que zero.";
    else if (Number.isInteger(vol) && niv > vol) e.nivel_cheio = "Não pode ser maior que o volume máximo.";
    return e;
  }

  async function enviar(e) {
    e.preventDefault();
    setErroApi("");
    const e2 = validar();
    setErros(e2);
    if (Object.keys(e2).length) return;

    setEnviando(true);
    try {
      const criada = await criarLixeira({
        uuid_sensor: form.uuid_sensor.trim(),
        tipo: form.tipo,
        volume_max: Number(form.volume_max),
        nivel_cheio: Number(form.nivel_cheio),
        ecoponto_id: ecoponto.id,
      });
      onCriada(criada);
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
      <Field label="Tipo de resíduo">
        <select className="input" value={form.tipo} onChange={mudar("tipo")}>
          {Object.entries(TIPOS).map(([valor, { label }]) => (
            <option key={valor} value={valor}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="UUID do sensor" erro={erros.uuid_sensor}>
        <input className="input" value={form.uuid_sensor} onChange={mudar("uuid_sensor")} placeholder="abc-123" />
      </Field>
      <button
        type="button"
        className="btn btn--secondary btn--block"
        onClick={() => setForm((f) => ({ ...f, uuid_sensor: crypto.randomUUID() }))}
      >
        <Sparkles size={18} aria-hidden="true" />
        Gerar UUID
      </button>
      <div className="form-row">
        <Field label="Volume máximo" erro={erros.volume_max}>
          <input className="input" inputMode="numeric" value={form.volume_max} onChange={mudar("volume_max")} placeholder="100" />
        </Field>
        <Field label="Nível de cheio" erro={erros.nivel_cheio}>
          <input className="input" inputMode="numeric" value={form.nivel_cheio} onChange={mudar("nivel_cheio")} placeholder="80" />
        </Field>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn--secondary" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={enviando}>
          <Plus size={18} aria-hidden="true" />
          {enviando ? "Salvando..." : "Cadastrar lixeira"}
        </button>
      </div>
    </form>
  );
}
