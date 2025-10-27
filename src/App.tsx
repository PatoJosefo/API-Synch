import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import { ContinuousCalendar } from "./components/ContinuousCalendar";
import Notificacoes from "./notifica";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
              <div className="h-full w-full max-w-7xl">
                <ContinuousCalendar />
              </div>
            </div>
          }
        />
        <Route
          path="/notificacoes"
          element={
            <div className="p-4">
              <Notificacoes />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
