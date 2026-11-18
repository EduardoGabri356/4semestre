import { MapPin, Star, Trash2 } from "lucide-react";
import { enderecoEcoponto } from "../lib/format.js";

export default function EcopontoCard({ ecoponto, quantidade, selecionado, onClick }) {
  return (
    <button
      type="button"
      className={"eco-card" + (selecionado ? " eco-card--selected" : "")}
      aria-pressed={selecionado}
      onClick={onClick}
    >
      <span className="eco-card__name">{ecoponto.nome}</span>
      <span className="eco-card__address">
        <MapPin size={16} aria-hidden="true" />
        <span>{enderecoEcoponto(ecoponto)}</span>
      </span>
      {ecoponto.descricao && <span className="eco-card__desc">{ecoponto.descricao}</span>}
      <span className="eco-card__foot">
        <span className="chip chip--pool">
          <Trash2 size={14} aria-hidden="true" />
          {quantidade} {quantidade === 1 ? "lixeira" : "lixeiras"}
        </span>
        {ecoponto.nota != null && (
          <span className="chip">
            <Star size={14} aria-hidden="true" />
            {ecoponto.nota}
          </span>
        )}
      </span>
    </button>
  );
}
