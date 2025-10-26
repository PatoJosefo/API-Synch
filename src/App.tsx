import Login from "./pages/Login/Login"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Teste from './pages/teste/teste';
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard/dashboard";


function App() {


  return (
    <div  className="App">

          <Routes>
            <Route path="/" element={<Login/>}/>
            <Route element={<PrivateRoute/>}>
              <Route path='/dashboard' element={<Dashboard/>}/>
            </Route>
          </Routes>

    </div>
  )
}

export default App
