import { MapPin } from "lucide-react";
import { infoTipo } from "../lib/tipos.js";

export default function LixeiraCard({ lixeira, ecoponto, onClick }) {
  const { label, Icon } = infoTipo(lixeira.tipo);
  return (
    <button type="button" className="lx-card" onClick={onClick}>
      <span className="badge-icon">
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="lx-card__text">
        <span className="lx-card__title">Lixeira #{lixeira.id}</span>
        <span className="lx-card__type">{label}</span>
      </span>
      <span className="lx-card__eco">
        <MapPin size={16} aria-hidden="true" />
        <span>{ecoponto ? ecoponto.nome : "Ecoponto não encontrado"}</span>
      </span>
    </button>
  );
}
