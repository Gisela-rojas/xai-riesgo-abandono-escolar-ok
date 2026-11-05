import { useState } from "react";
import "./estilos.css";
import Login from "./pantallas/Login";
import Registro from "./pantallas/Registro";
import CargarDatos from "./pantallas/CargarDatos";
import Dashboard from "./pantallas/Dashboard";
import Explicacion from "./pantallas/Explicacion";
import Historial from "./pantallas/Historial";
import Reportes from "./pantallas/Reportes";
import Auditoria from "./pantallas/Auditoria";

const MENU = [
  { id: "dashboard", texto: "Dashboard de riesgo", hu: "HU-002 · HU-004 · HU-005" },
  { id: "cargar", texto: "Cargar datos", hu: "HU-001" },
  { id: "explicacion", texto: "Explicación del riesgo", hu: "HU-003" },
  { id: "historial", texto: "Historial e intervenciones", hu: "HU-008" },
  { id: "reportes", texto: "Reportes", hu: "HU-009" },
  { id: "auditoria", texto: "Auditoría de sesgo", hu: "HU-006" },
];

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [acceso, setAcceso] = useState("login");
  const [vista, setVista] = useState("dashboard");
  const [estudianteSel, setEstudianteSel] = useState(null);

  if (!usuario) {
    return acceso === "login" ? (
      <Login onLogin={setUsuario} irARegistro={() => setAcceso("registro")} />
    ) : (
      <Registro irALogin={() => setAcceso("login")} />
    );
  }

  const verExplicacion = (est) => {
    setEstudianteSel(est);
    setVista("explicacion");
  };

  return (
    <div className="app">
      <aside className="menu">
        <div className="marca">Sistema XAI</div>
        <nav>
          {MENU.map((op) => (
            <button
              key={op.id}
              className={vista === op.id ? "op activa" : "op"}
              onClick={() => setVista(op.id)}
            >
              <span>{op.texto}</span>
              <small>{op.hu}</small>
            </button>
          ))}
        </nav>
        <div className="usuario">
          <span>{usuario.nombre || usuario.correo}</span>
          <button className="salir" onClick={() => setUsuario(null)}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="contenido">
        {vista === "dashboard" && <Dashboard onVerExplicacion={verExplicacion} />}
        {vista === "cargar" && <CargarDatos />}
        {vista === "explicacion" && <Explicacion estudiante={estudianteSel} irADashboard={() => setVista("dashboard")} />}
        {vista === "historial" && <Historial />}
        {vista === "reportes" && <Reportes />}
        {vista === "auditoria" && <Auditoria />}
      </main>
    </div>
  );
}
