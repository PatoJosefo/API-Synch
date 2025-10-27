import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {

  const navigate = useNavigate()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        
        <div className="flex items-center space-x-2">
          <img src="/public/logonewe2.png" alt="Logo" className="h-8 w-auto" /> 
          <span className="text-xl font-bold text-blue-600">Newe Formulário</span>
        </div>
        
        
        <nav className="hidden md:flex space-x-4">
          <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">Perfil</a> <br />
          <a href="#" className="text-blue-600 hover:text-blue-500 font-medium" onClick={() => navigate('/')}>Sair</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

