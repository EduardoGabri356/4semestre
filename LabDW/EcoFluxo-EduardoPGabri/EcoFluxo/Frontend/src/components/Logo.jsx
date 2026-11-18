// Logo provisória do EcoFluxo: folha (verde piscina) sobre quadrado azul royal.
// Para usar a logo oficial, troque o conteúdo deste componente por <img src="..." />.
export default function Logo({ size = 40, tone = "default", showWord = true }) {
  const inverse = tone === "inverse";
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="EcoFluxo" className="logo__mark">
        <rect width="48" height="48" rx="14" fill={inverse ? "#E5E4E2" : "#4169E1"} />
        <path d="M13 31c0-10 7-16 21-17 0 12-5 19-15 19-2 0-4-.6-6-2z" fill="#2BC8B5" />
        <path
          d="M12 37c6-9 12-13 19-16"
          stroke={inverse ? "#4169E1" : "#fff"}
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showWord && (
        <span className="logo__word" style={{ fontSize: size * 0.55 }}>
          EcoFluxo
        </span>
      )}
    </span>
  );
}
