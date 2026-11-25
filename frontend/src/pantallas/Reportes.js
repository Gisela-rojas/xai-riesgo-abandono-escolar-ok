import { useEffect, useState } from "react";
import { obtenerEstudiantes, descargarReporteEstudiante, descargarReporteAula } from "../api";

// HU-009: Exportar reporte de riesgo (Excel)
export default function Reportes() {
  const [grados, setGrados] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [cargado, setCargado] = useState(false);

  const [codigo, setCodigo] = useState("");
  const [grado, setGrado] = useState("");
  const [aula, setAula] = useState("");

  const [msgInd, setMsgInd] = useState(null);
  const [msgAula, setMsgAula] = useState(null);
  const [trabajando, setTrabajando] = useState("");

  useEffect(() => {
    obtenerEstudiantes()
      .then((lista) => {
        setGrados([...new Set(lista.map((e) => e.grado).filter(Boolean))].sort());
        setAulas([...new Set(lista.map((e) => e.aula).filter(Boolean))].sort());
      })
      .catch(() => {})
      .finally(() => setCargado(true));
  }, []);

  const sinDatos = cargado && grados.length === 0;

  const exportarIndividual = async () => {
    setMsgInd(null);
    const id = parseInt(codigo, 10);
    if (Number.isNaN(id) || id <= 0) {
      setMsgInd({ tipo: "error", texto: "Ingresa un código de estudiante válido." });
      return;
    }
    setTrabajando("ind");
    try {
      await descargarReporteEstudiante(id);
      setMsgInd({ tipo: "ok", texto: "Reporte descargado. Se abre en Excel." });
    } catch (e) {
      setMsgInd({ tipo: "error", texto: e.message });
    }
    setTrabajando("");
  };

  const exportarAula = async () => {
    setMsgAula(null);
    if (!grado || !aula) {
      setMsgAula({ tipo: "error", texto: "Elige el grado y el aula." });
      return;
    }
    setTrabajando("aula");
    try {
      await descargarReporteAula(grado, aula);
      setMsgAula({ tipo: "ok", texto: "Reporte descargado. Se abre en Excel." });
    } catch (e) {
      setMsgAula({ tipo: "error", texto: e.message });
    }
    setTrabajando("");
  };

  return (
    <>
      <h1>Reportes</h1>
      <p className="sub">Descarga el reporte de riesgo en Excel para compartirlo con la coordinación TOE.</p>

      {sinDatos && (
        <div className="msg info">No hay datos disponibles para este periodo. Primero carga estudiantes.</div>
      )}

      <div className="panel">
        <h3>Reporte individual</h3>
        <p className="sub">Incluye los datos del estudiante, su nivel de riesgo y los factores que lo explican.</p>
        <div className="fila">
          <label className="campo">Código del estudiante
            <input
              type="number"
              min="1"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") exportarIndividual(); }}
              placeholder="Ej. 5080"
            />
          </label>
          <button className="btn" onClick={exportarIndividual} disabled={trabajando === "ind" || sinDatos}>
            {trabajando === "ind" ? "Generando..." : "Exportar a Excel"}
          </button>
        </div>
        {msgInd && <div className={`msg ${msgInd.tipo}`}>{msgInd.texto}</div>}
      </div>

      <div className="panel">
        <h3>Reporte por aula</h3>
        <p className="sub">Incluye el resumen por nivel de riesgo y la lista de estudiantes, de mayor a menor riesgo.</p>
        <div className="fila">
          <label className="campo">Grado
            <select value={grado} onChange={(e) => setGrado(e.target.value)}>
              <option value="">Elige un grado</option>
              {grados.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className="campo">Aula
            <select value={aula} onChange={(e) => setAula(e.target.value)}>
              <option value="">Elige un aula</option>
              {aulas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <button className="btn" onClick={exportarAula} disabled={trabajando === "aula" || sinDatos}>
            {trabajando === "aula" ? "Generando..." : "Exportar a Excel"}
          </button>
        </div>
        {msgAula && <div className={`msg ${msgAula.tipo}`}>{msgAula.texto}</div>}
      </div>
    </>
  );
}