import { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '#' },
    { label: 'Formulários', path: '##' },
    { label: 'Veículos', path: '#' },
    { label: 'Relatórios', path: '##' },
    { label: 'Configurações', path: '#' },
  ];

  return (
    <>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsOpen(false)}/>
      )}

      
      <button
        className="fixed top-4 left-4 z-50 p-2 lg:hidden bg-blue-600 text-white rounded-md"
        onClick={() => setIsOpen(true)}
      >
        ☰
      </button>

      
      <aside className={`
        fixed lg:static top-0 left-0 h-full bg-gradient-to-b from-blue-800 to-blue-900 text-white z-40
        w-64 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold">Newe Log</h1>
          </div>
        </div>

        
        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.path}
                  className="flex items-center p-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;