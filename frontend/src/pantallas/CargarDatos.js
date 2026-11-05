import { useState } from "react";
import { cargarEstudiantes } from "../api";

// HU-001: Cargar datos académicos y de asistencia (CSV/Excel)
const EXTENSIONES = [".csv", ".xlsx", ".xls"];

export default function CargarDatos() {
  const [archivo, setArchivo] = useState(null);
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargar = async () => {
    setMsg(null);
    if (!archivo) {
      setMsg({ tipo: "error", texto: "Selecciona un archivo primero." });
      return;
    }
    const nombre = archivo.name.toLowerCase();
    if (!EXTENSIONES.some((ext) => nombre.endsWith(ext))) {
      // Escenario 2: formato inválido
      setMsg({ tipo: "error", texto: "Formato no soportado. Usa un archivo CSV o Excel (.csv, .xlsx, .xls)." });
      return;
    }
    setCargando(true);
    try {
      const data = await cargarEstudiantes(archivo);
      if (data.exito) {
        // Escenario 1: carga exitosa
        setMsg({ tipo: "ok", texto: `Carga exitosa: ${data.registros_guardados} registros guardados.` });
      } else {
        // Escenario 2: columnas faltantes u otro rechazo del backend
        setMsg({ tipo: "error", texto: data.error || "No se pudo cargar el archivo." });
      }
    } catch {
      setMsg({ tipo: "error", texto: "No hay conexión con el servidor. Revisa que el backend esté prendido." });
    }
    setCargando(false);
  };

  return (
    <>
      <h1>Cargar datos de estudiantes</h1>
      <p className="sub">
        Sube un archivo CSV o Excel con: id del estudiante, género, asistencia, promedio académico,
        cursos desaprobados, inasistencias consecutivas, rendimiento académico, grado y aula.
      </p>
      <div className="panel">
        <div className="fila">
          <label className="campo" style={{ flex: 1 }}>Archivo
            <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => setArchivo(e.target.files[0])} />
          </label>
          <button className="btn" onClick={cargar} disabled={cargando}>
            {cargando ? "Cargando..." : "Cargar datos"}
          </button>
        </div>
        {msg && <div className={`msg ${msg.tipo}`}>{msg.texto}</div>}
        <div className="msg info">Privacidad (HU-007): identifica a cada estudiante con un código, sin nombres ni DNI.</div>
      </div>
    </>
  );
}