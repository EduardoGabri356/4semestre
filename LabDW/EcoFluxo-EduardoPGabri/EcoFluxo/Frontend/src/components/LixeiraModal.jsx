import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { infoTipo } from "../lib/tipos.js";
import { enderecoEcoponto, formatarCep, formatarData } from "../lib/format.js";

const FOCAVEIS = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function LixeiraModal({ lixeira, ecoponto, onClose }) {
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const aberturaFocada = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalRef.current?.querySelector("button")?.focus();

    // Esc fecha; Tab fica preso dentro do modal
    const aoTeclar = (e) => {
      if (e.key === "Escape") return onCloseRef.current();
      if (e.key !== "Tab") return;
      const itens = modalRef.current?.querySelectorAll(FOCAVEIS);
      if (!itens?.length) return;
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
      aberturaFocada?.focus?.(); // devolve o foco para o item que abriu o modal
    };
  }, []);

  const { label, Icon } = infoTipo(lixeira.tipo);
  const porcentagem =
    lixeira.volume_max > 0 ? Math.min(100, Math.round((lixeira.nivel_cheio / lixeira.volume_max) * 100)) : 0;

  return createPortal(
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <div className="modal__head">
          <span className="badge-icon badge-icon--lg">
            <Icon size={26} aria-hidden="true" />
          </span>
          <div className="modal__title">
            <h2 id="modal-titulo">Lixeira #{lixeira.id}</h2>
            <span className="chip">{label}</span>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <dl className="info-grid">
          <div className="info info--full">
            <dt>Ecoponto</dt>
            <dd>{ecoponto ? ecoponto.nome : "Ecoponto não encontrado"}</dd>
            {ecoponto && (
              <>
                <dd className="info__sub">
                  {enderecoEcoponto(ecoponto)}
                  {ecoponto.cep ? `, CEP ${formatarCep(ecoponto.cep)}` : ""}
                </dd>
                <dd className="info__sub">
                  Coordenadas {ecoponto.latitude}, {ecoponto.longitude}{" "}
                  <a
                    className="link"
                    href={`https://www.google.com/maps?q=${encodeURIComponent(`${ecoponto.latitude},${ecoponto.longitude}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir no mapa
                  </a>
                </dd>
              </>
            )}
          </div>

          <div className="info info--full">
            <dt>Sensor (UUID)</dt>
            <dd className="info__wrap">{lixeira.uuid_sensor}</dd>
          </div>

          <div className="info">
            <dt>Tipo de resíduo</dt>
            <dd>{label}</dd>
          </div>
          <div className="info">
            <dt>Cadastrada em</dt>
            <dd>{formatarData(lixeira.criadoEm)}</dd>
          </div>
          <div className="info">
            <dt>Volume máximo</dt>
            <dd>{lixeira.volume_max}</dd>
          </div>
          <div className="info">
            <dt>Nível de cheio</dt>
            <dd>{lixeira.nivel_cheio}</dd>
          </div>

          <div className="info info--full">
            <dt>Nível de cheio em relação ao volume máximo</dt>
            <dd>
              <div className="meter" role="img" aria-label={`${porcentagem}% do volume máximo`}>
                <div className="meter__fill" style={{ width: `${porcentagem}%` }} />
              </div>
              <span className="info__sub">
                {lixeira.nivel_cheio} de {lixeira.volume_max} ({porcentagem}%)
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>,
    document.body
  );
}
