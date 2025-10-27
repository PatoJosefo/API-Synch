import Login from "./pages/Login/Login"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import FormCadastro from './pages/formulario-cadastro/formCadastro';

function App() {


  return (
    <div  className="App">
          <Routes>
            <Route path="/" element={<Login/>}/>
            <Route element={<PrivateRoute/>}>
              <Route path='/dashboard' element={<Dashboard/>}/>
              <Route path="/FormCadastro" element={<FormCadastro/>}/>
            </Route>
          </Routes>

    </div>
  )
}

export default App

