import { MapPin, Plus } from "lucide-react";
import { infoTipo } from "../lib/tipos.js";
import { enderecoEcoponto } from "../lib/format.js";

export default function PainelLixeiras({ ecoponto, lixeiras, podeGerenciar, onAbrir, onNovaLixeira, onNovoEcoponto, onFechar }) {
  return (
    <>
      <div className="panel-head">
        <h2 className="panel-title">{ecoponto.nome}</h2>
        <p className="panel-sub">
          <MapPin size={16} aria-hidden="true" />
          <span>{enderecoEcoponto(ecoponto)}</span>
        </p>
      </div>

      <div className="panel-actions">
        {podeGerenciar ? (
          <>
            <button type="button" className="btn btn--primary" onClick={onNovaLixeira}>
              <Plus size={18} aria-hidden="true" />
              Nova lixeira
            </button>
            <button type="button" className="btn btn--secondary" onClick={onNovoEcoponto}>
              Novo ecoponto
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--secondary" onClick={onFechar}>
            Fechar
          </button>
        )}
      </div>

      <h3 className="panel-section">
        Lixeiras <span className="chip chip--pool">{lixeiras.length}</span>
      </h3>

      {lixeiras.length === 0 ? (
        <p className="state state--small">
          Este ecoponto ainda não tem lixeiras.{podeGerenciar ? " Use “Nova lixeira” para cadastrar a primeira." : ""}
        </p>
      ) : (
        <ul className="lx-list">
          {lixeiras.map((l) => {
            const { label, Icon } = infoTipo(l.tipo);
            return (
              <li key={l.id}>
                <button type="button" className="lx-row" onClick={() => onAbrir(l)}>
                  <span className="badge-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className="lx-row__text">
                    <span className="lx-row__title">Lixeira #{l.id}</span>
                    <span className="lx-row__sub">
                      {label}, sensor {l.uuid_sensor}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
