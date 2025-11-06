import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Calendario from "./pages/Calendario/Calendario.tsx";
import Notificacoes from "./pages/Notificacoes/Notificacoes";
import CadastroFuncionario from "./pages/CadastroFuncionario/CadastroFuncionario";
import FormularioAgregado from "./pages/FormularioAgregado/FormAgregado.tsx";

function App() {
  return (
    <div className="App">
        <Routes>
          {/* Rota Pública - Login */}
          <Route path="/" element={<Login />} />

          {/* Rotas Protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/notificacoes" element={<Notificacoes />} /> 
            <Route path="/cadastro-funcionario" element={<CadastroFuncionario />} /> 
            <Route path="/formulario-agregado" element={<FormularioAgregado />} />
          </Route>
        </Routes>
    </div>
  );
}

export default App;
