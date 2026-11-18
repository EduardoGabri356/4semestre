import { Link, NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const classeLink = ({ isActive }) => "nav-link" + (isActive ? " nav-link--active" : "");

export default function Header() {
  const { usuario, sair } = useAuth();
  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/ecopontos" className="header__brand">
          <Logo size={40} />
        </Link>
        <nav className="header__nav" aria-label="Principal">
          <NavLink to="/ecopontos" className={classeLink}>
            Ecopontos
          </NavLink>
          <NavLink to="/lixeiras" className={classeLink}>
            Lixeiras
          </NavLink>
        </nav>
        <div className="header__user">
          <span className="header__name">{usuario.nome}</span>
          <button type="button" className="btn btn--ghost" onClick={sair}>
            <LogOut size={18} aria-hidden="true" />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
