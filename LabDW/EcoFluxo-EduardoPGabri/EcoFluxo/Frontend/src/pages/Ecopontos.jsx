import { useState } from "react";
import EcopontoCard from "../components/EcopontoCard.jsx";
import EcopontoForm from "../components/EcopontoForm.jsx";
import LixeiraForm from "../components/LixeiraForm.jsx";
import LixeiraModal from "../components/LixeiraModal.jsx";
import PainelLixeiras from "../components/PainelLixeiras.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";

export default function Ecopontos() {
  const { usuario } = useAuth();
  const { ecopontos, ecopontoPorId, lixeirasPorEcoponto, carregando, erro, carregar } = useData();
  const podeGerenciar = usuario.perfil === "GESTOR";

  const [selecionadoId, setSelecionadoId] = useState(null);
  const [modo, setModo] = useState("criar"); // criar | ver | nova-lixeira
  const [lixeiraAberta, setLixeiraAberta] = useState(null);

  const selecionado = selecionadoId != null ? ecopontoPorId.get(selecionadoId) : null;
  const lixeirasDoSelecionado = selecionado ? lixeirasPorEcoponto.get(selecionado.id) ?? [] : [];

  function alternar(ecoponto) {
    if (ecoponto.id === selecionadoId) {
      setSelecionadoId(null);
      setModo("criar");
    } else {
      setSelecionadoId(ecoponto.id);
      setModo("ver");
    }
  }

  function voltarParaCriar() {
    setSelecionadoId(null);
    setModo("criar");
  }

  let painel;
  if (!selecionado || modo === "criar") {
    painel = (
      <>
        <div className="panel-head">
          <h2 className="panel-title">Novo ecoponto</h2>
          <p className="panel-sub">Selecione um ecoponto na lista para ver as lixeiras dele.</p>
        </div>
        {podeGerenciar ? (
          <EcopontoForm
            onCriado={(criado) => {
              setSelecionadoId(criado.id);
              setModo("ver");
            }}
          />
        ) : (
          <p className="state state--small">Somente gestores podem criar ecopontos.</p>
        )}
      </>
    );
  } else if (modo === "nova-lixeira") {
    painel = (
      <>
        <div className="panel-head">
          <h2 className="panel-title">Nova lixeira</h2>
          <p className="panel-sub">Ecoponto: {selecionado.nome}</p>
        </div>
        <LixeiraForm ecoponto={selecionado} onCriada={() => setModo("ver")} onCancelar={() => setModo("ver")} />
      </>
    );
  } else {
    painel = (
      <PainelLixeiras
        ecoponto={selecionado}
        lixeiras={lixeirasDoSelecionado}
        podeGerenciar={podeGerenciar}
        onAbrir={setLixeiraAberta}
        onNovaLixeira={() => setModo("nova-lixeira")}
        onNovoEcoponto={voltarParaCriar}
        onFechar={voltarParaCriar}
      />
    );
  }

  return (
    <div className="workspace">
      <section className="workspace__list" aria-labelledby="titulo-ecopontos">
        <div className="page-head">
          <h1 id="titulo-ecopontos">Ecopontos</h1>
          {!carregando && !erro && <span className="chip chip--pool">{ecopontos.length}</span>}
        </div>

        {carregando && <p className="state">Carregando ecopontos...</p>}

        {erro && (
          <div className="state">
            <p>{erro}</p>
            <button type="button" className="btn btn--secondary" onClick={carregar}>
              Tentar de novo
            </button>
          </div>
        )}

        {!carregando && !erro && ecopontos.length === 0 && (
          <p className="state">
            Nenhum ecoponto criado ainda.{podeGerenciar ? " Use o formulário ao lado para criar o primeiro." : ""}
          </p>
        )}

        {!carregando && !erro && ecopontos.length > 0 && (
          <div className="eco-grid">
            {ecopontos.map((e) => (
              <EcopontoCard
                key={e.id}
                ecoponto={e}
                quantidade={(lixeirasPorEcoponto.get(e.id) ?? []).length}
                selecionado={e.id === selecionadoId}
                onClick={() => alternar(e)}
              />
            ))}
          </div>
        )}
      </section>

      <aside className="side-panel" aria-live="polite">
        {painel}
      </aside>

      {lixeiraAberta && (
        <LixeiraModal
          lixeira={lixeiraAberta}
          ecoponto={ecopontoPorId.get(lixeiraAberta.ecoponto_id)}
          onClose={() => setLixeiraAberta(null)}
        />
      )}
    </div>
  );
}
