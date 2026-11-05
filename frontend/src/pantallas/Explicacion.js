import { useEffect, useState } from "react";
import { nivelDe } from "./Dashboard";
import { enviarFeedback, obtenerExplicacion } from "../api";

// HU-003: Factores que explican el riesgo, en lenguaje sencillo
export default function Explicacion({ estudiante, irADashboard }) {
  const [feedback, setFeedback] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorFb, setErrorFb] = useState("");
  const [explicacion, setExplicacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorExp, setErrorExp] = useState("");

  const idEstudiante = estudiante ? estudiante.id_estudiante : null;

  useEffect(() => {
    if (idEstudiante === null) return;
    setExplicacion(null);
    setErrorExp("");
    setFeedback(false);
    setCargando(true);
    obtenerExplicacion(idEstudiante)
      .then(setExplicacion)
      .catch((e) => setErrorExp(e.message))
      .finally(() => setCargando(false));
  }, [idEstudiante]);

  if (!estudiante) {
    return (
      <>
        <h1>Explicación del riesgo</h1>
        <div className="panel">
          <div className="msg info">Elige un estudiante en el Dashboard y presiona "Ver explicación".</div>
          <button className="btn" onClick={irADashboard}>Ir al dashboard</button>
        </div>
      </>
    );
  }

  const factores = explicacion ? explicacion.factores || [] : [];
  const nivel = explicacion ? explicacion.nivel : nivelDe(estudiante);

  const reportar = async () => {
    setErrorFb("");
    setEnviando(true);
    try {
      await enviarFeedback(estudiante.id_estudiante, "Explicación no comprendida");
      setFeedback(true);
    } catch (e) {
      setErrorFb(e.message);
    }
    setEnviando(false);
  };

  return (
    <>
      <h1>Explicación del riesgo</h1>
      <p className="sub">Estudiante {estudiante.id_estudiante}</p>
      <div className="panel">
        <p>Nivel de riesgo: <span className={`riesgo ${nivel}`}>
          {nivel === "pendiente" ? "Sin calcular" : nivel}
        </span></p>

        <h3>Factores que más influyen</h3>
        {cargando && <div className="msg info">Calculando la explicación...</div>}
        {errorExp && <div className="msg error">{errorExp}</div>}
        {!cargando && !errorExp && factores.length === 0 && (
          <div className="msg aviso">No hay factores disponibles para este estudiante.</div>
        )}
        {factores.length > 0 && (
          <ol>
            {factores.map((f, i) => (
              <li key={i}><b>{f.nombre}:</b> {f.descripcion}</li>
            ))}
          </ol>
        )}

        <h3>Datos del estudiante</h3>
        <ul>
          <li>Asistencia: {estudiante.asistencia}%</li>
          <li>Promedio académico: {estudiante.promedio_academico}</li>
          <li>Cursos desaprobados: {estudiante.cursos_desaprobados}</li>
          <li>Inasistencias seguidas: {estudiante.inasistencias_consecutivas}</li>
        </ul>

        {feedback ? (
          <div className="msg ok">Gracias. El caso quedó registrado para revisión del equipo.</div>
        ) : (
          <>
            <button className="btn btn-sec" onClick={reportar} disabled={enviando}>
              {enviando ? "Enviando..." : "No entendí esta explicación"}
            </button>
            {errorFb && <div className="msg error">{errorFb}</div>}
          </>
        )}
      </div>
    </>
  );
}