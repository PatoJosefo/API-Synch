import { Routes, Route } from "react-router-dom";
import FunnelView from "./features/funnel/FunnelView";

function App() {
  return (
    <Routes>
      <Route path="/" element={<FunnelView />} />
      <Route path="/funil" element={<FunnelView />} />
    </Routes>
  );
}

export default App;
