import { Link, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  const linkClasses = (path: string) =>
    `px-4 py-2 rounded-md font-semibold transition-colors ${
      location.pathname === path
        ? "bg-blue-500 text-white"
        : "text-blue-700 hover:bg-blue-200"
    }`;

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-blue-700">API-Synch</div>
      <nav className="flex gap-2">
        <Link to="/" className={linkClasses("/")}>
          Calendário
        </Link>
        <Link to="/notificacoes" className={linkClasses("/notificacoes")}>
          Notificações
        </Link>
      </nav>
    </header>
  );
}

export default Header;
