import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./PAGES/Login";
import Registro from "./PAGES/Registro";
import CargarDatos from "./PAGES/CargarDatos";
import Dashboard from "./PAGES/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/cargar-datos" element={<CargarDatos />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;