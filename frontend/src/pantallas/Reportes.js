import { useEffect, useState } from "react";
import { obtenerEstudiantes } from "../api";
import { nivelDe } from "./Dashboard";

// HU-009: Exportar reporte de riesgo
export default function Reportes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    obtenerEstudiantes().then(setEstudiantes).catch(() => setEstudiantes([]));
  }, []);

  const sinDatos = () => {
    setMsg({ tipo: "info", texto: "No hay datos disponibles para este periodo. Primero carga estudiantes." });
  };

  const exportarExcel = () => {
    if (estudiantes.length === 0) return sinDatos();
    const cab = ["Codigo", "Genero", "Asistencia", "Promedio", "Cursos desaprobados", "Inasistencias seguidas", "Riesgo"];
    const filas = estudiantes.map((e) => [
      e.id_estudiante, e.genero, e.asistencia, e.promedio_academico,
      e.cursos_desaprobados, e.inasistencias_consecutivas,
      nivelDe(e) === "pendiente" ? "Sin calcular" : nivelDe(e),
    ]);
    const csv = "\uFEFF" + [cab, ...filas].map((f) => f.join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "reporte_riesgo.csv"; a.click();
    URL.revokeObjectURL(url);
    setMsg({ tipo: "ok", texto: "Reporte descargado (se abre en Excel)." });
  };

  const exportarPDF = () => {
    if (estudiantes.length === 0) return sinDatos();
    window.print(); // en la ventana elige "Guardar como PDF"
  };

  return (
    <>
      <h1>Reportes</h1>
      <p className="sub">Descarga el reporte de riesgo para compartirlo con la coordinación TOE.</p>
      <div className="panel no-imprimir">
        <div className="fila">
          <button className="btn" onClick={exportarExcel}>Exportar a Excel</button>
          <button className="btn btn-sec" onClick={exportarPDF}>Exportar a PDF</button>
        </div>
        {msg && <div className={`msg ${msg.tipo}`}>{msg.texto}</div>}
      </div>

      {estudiantes.length > 0 && (
        <div className="panel">
          <h3>Vista previa del reporte</h3>
          <div className="tabla-caja">
            <table>
              <thead><tr><th>Código</th><th>Asistencia</th><th>Promedio</th><th>Riesgo</th></tr></thead>
              <tbody>
                {estudiantes.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id_estudiante}</td><td>{e.asistencia}%</td><td>{e.promedio_academico}</td>
                    <td>{nivelDe(e) === "pendiente" ? "Sin calcular" : nivelDe(e)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
