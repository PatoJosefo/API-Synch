import React from 'react';
import { BrowserRouter ,Routes, Route } from 'react-router-dom';
import FormCadastro from './pages/formulario-cadastro/formCadastro';


function App() {
  return (
    <>
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormCadastro/>}/>
      </Routes>
    </BrowserRouter>

    </>
    
  );
};

export default App;