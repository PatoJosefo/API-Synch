import Login from "./pages/Login/Login"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Teste from './pages/teste/teste';

function App() {


  return (
    <div  className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/Teste" element={<Teste/>}></Route>
        </Routes>

      </BrowserRouter>
        
    </div>
  )
}

export default App
