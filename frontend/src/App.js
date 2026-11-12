import { Fragment, useState } from "react";
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
  { id: "dashboard", texto: "Dashboard de riesgo", grupo: "Riesgo", icono: "📊", color: "#60a5fa" },
  { id: "cargar", texto: "Cargar datos", grupo: "Riesgo", icono: "📁", color: "#34d399" },
  { id: "explicacion", texto: "Explicación del riesgo", grupo: "Riesgo", icono: "💡", color: "#a78bfa" },
  { id: "historial", texto: "Historial e intervenciones", grupo: "Seguimiento", icono: "🕒", color: "#fbbf24" },
  { id: "reportes", texto: "Reportes", grupo: "Seguimiento", icono: "📄", color: "#f472b6" },
  { id: "auditoria", texto: "Auditoría de sesgo", grupo: "Seguimiento", icono: "⚖️", color: "#2dd4bf" },
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
          {MENU.map((op, i) => (
            <Fragment key={op.id}>
              {(i === 0 || MENU[i - 1].grupo !== op.grupo) && (
                <div className="menu-grupo">{op.grupo}</div>
              )}
              <button
                className={vista === op.id ? "op activa" : "op"}
                style={{ "--color": op.color }}
                onClick={() => setVista(op.id)}
              >
                <span className="op-icono">{op.icono}</span>
                <span className="op-texto">{op.texto}</span>
              </button>
            </Fragment>
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