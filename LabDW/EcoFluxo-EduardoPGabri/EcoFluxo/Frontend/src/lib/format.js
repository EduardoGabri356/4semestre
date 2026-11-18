export function enderecoEcoponto(e) {
  const rua = [e.logradouro, e.numero].filter(Boolean).join(", ");
  const cidade = [e.cidade, e.uf].filter(Boolean).join(" - ");
  const partes = [rua, e.bairro, cidade].filter(Boolean);
  return partes.length ? partes.join(", ") : "Endereço não informado";
}

export function formatarData(valor) {
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
}

// remove acentos e caixa para a busca por ecoponto
export function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatarCep(cep) {
  const d = String(cep ?? "").replace(/\D/g, "");
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : cep ?? "";
}
