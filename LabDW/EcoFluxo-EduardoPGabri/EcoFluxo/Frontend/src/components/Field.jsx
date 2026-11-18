export default function Field({ label, erro, children, className = "" }) {
  return (
    <label className={`field ${className}`}>
      <span className="field__label">{label}</span>
      {children}
      {erro && <span className="field__error">{erro}</span>}
    </label>
  );
}
