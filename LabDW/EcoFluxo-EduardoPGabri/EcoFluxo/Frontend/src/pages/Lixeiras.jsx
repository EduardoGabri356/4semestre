import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import LixeiraCard from "../components/LixeiraCard.jsx";
import LixeiraModal from "../components/LixeiraModal.jsx";
import { useData } from "../context/DataContext.jsx";
import { normalizar } from "../lib/format.js";

export default function Lixeiras() {
  const { lixeiras, ecopontoPorId, carregando, erro, carregar } = useData();
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState(null);

  const filtradas = useMemo(() => {
    const termo = normalizar(busca);
    if (!termo) return lixeiras;
    return lixeiras.filter((l) => normalizar(ecopontoPorId.get(l.ecoponto_id)?.nome).includes(termo));
  }, [lixeiras, ecopontoPorId, busca]);

  return (
    <div className="page">
      <div className="page-head">
        <h1>Lixeiras</h1>
        {!carregando && !erro && <span className="chip chip--pool">{filtradas.length}</span>}
      </div>

      <div className="search">
        <Search size={20} aria-hidden="true" className="search__icon" />
        <input
          type="search"
          className="input search__input"
          placeholder="Pesquisar lixeiras por ecoponto"
          aria-label="Pesquisar lixeiras por ecoponto"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {carregando && <p className="state">Carregando lixeiras...</p>}

      {erro && (
        <div className="state">
          <p>{erro}</p>
          <button type="button" className="btn btn--secondary" onClick={carregar}>
            Tentar de novo
          </button>
        </div>
      )}

      {!carregando && !erro && lixeiras.length === 0 && (
        <p className="state">Nenhuma lixeira cadastrada ainda. Abra um ecoponto na aba Ecopontos para cadastrar.</p>
      )}

      {!carregando && !erro && lixeiras.length > 0 && filtradas.length === 0 && (
        <p className="state">Nenhuma lixeira encontrada para “{busca.trim()}”.</p>
      )}

      {filtradas.length > 0 && (
        <div className="lx-grid">
          {filtradas.map((l) => (
            <LixeiraCard key={l.id} lixeira={l} ecoponto={ecopontoPorId.get(l.ecoponto_id)} onClick={() => setAberta(l)} />
          ))}
        </div>
      )}

      {aberta && <LixeiraModal lixeira={aberta} ecoponto={ecopontoPorId.get(aberta.ecoponto_id)} onClose={() => setAberta(null)} />}
    </div>
  );
}
