import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const FloatingNavbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Calendário', path: '/calendario', icon: '📅' },
    { name: 'Funil de Vendas', path: '/funil', icon: '🎯' },
    { name: 'Notificações', path: '/notificacoes', icon: '🔔' },
    { name: 'Cadastro', path: '/cadastro-funcionario', icon: '👤' },
    { name: 'Formulário', path: '/formulario-agregado', icon: '📝' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Navbar Desktop - Flutuante no topo com mais espaço */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <div className="bg-white/40 backdrop-blur-xl shadow-2xl rounded-full px-6 py-4 border border-gray-200/50">
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300
                  ${isActive(item.path)
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                  }
                `}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}

            {/* Botão Logout */}
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/';
              }}
              className="ml-2 px-5 py-2.5 rounded-full font-medium text-sm text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-105"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </nav>

      {/* Navbar Mobile - Hamburguer */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-6 right-6 z-50 bg-white/40 backdrop-blur-xl shadow-lg rounded-full p-3 border border-gray-200/50"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setIsMenuOpen(false)}>
            <div
              className="fixed top-24 right-6 bg-white/40 backdrop-blur-xl shadow-2xl rounded-2xl p-4 border border-gray-200/50 min-w-[200px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300
                      ${isActive(item.path)
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}

                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                  }}
                  className="px-4 py-3 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 transition-all duration-300"
                >
                  🚪 Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingNavbar;
