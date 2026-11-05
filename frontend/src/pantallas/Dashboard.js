import { useEffect, useState } from "react";
import { obtenerEstudiantes, obtenerRiesgo } from "../api";

// HU-002 (puntaje), HU-004 (lista por nivel de riesgo), HU-005 (filtros)
const ORDEN = { alto: 3, medio: 2, bajo: 1 };

export function nivelDe(est) {
  // Cuando el backend envíe la lista con riesgo (HU-004), vendrá en "nivel_riesgo"
  return (est.nivel_riesgo || "").toLowerCase() || "pendiente";
}

export default function Dashboard({ onVerExplicacion }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [fRiesgo, setFRiesgo] = useState("todos");
  const [fGenero, setFGenero] = useState("todos");
  const [fGrado, setFGrado] = useState("todos");
  const [fAula, setFAula] = useState("todos");

  // HU-002: consulta del riesgo de un estudiante
  const [idConsulta, setIdConsulta] = useState("");
  const [riesgo, setRiesgo] = useState(null);
  const [errorRiesgo, setErrorRiesgo] = useState("");
  const [consultando, setConsultando] = useState(false);

  useEffect(() => {
    obtenerEstudiantes()
      .then(setEstudiantes)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  const consultarRiesgo = async () => {
    setRiesgo(null);
    setErrorRiesgo("");
    const id = parseInt(idConsulta, 10);
    if (Number.isNaN(id)) {
      setErrorRiesgo("Escribe el número del estudiante.");
      return;
    }
    setConsultando(true);
    try {
      setRiesgo(await obtenerRiesgo(id));
    } catch (e) {
      setErrorRiesgo(e.message);
    }
    setConsultando(false);
  };

  const filtrados = estudiantes
    .filter((e) => fRiesgo === "todos" || nivelDe(e) === fRiesgo)
    .filter((e) => fGenero === "todos" || (e.genero || "").toUpperCase() === fGenero)
    .filter((e) => fGrado === "todos" || e.grado === fGrado)
    .filter((e) => fAula === "todos" || e.aula === fAula)
    .sort((a, b) => (ORDEN[nivelDe(b)] || 0) - (ORDEN[nivelDe(a)] || 0));

  const contar = (n) => estudiantes.filter((e) => nivelDe(e) === n).length;
  const grados = [...new Set(estudiantes.map((e) => e.grado).filter(Boolean))].sort();
  const aulas = [...new Set(estudiantes.map((e) => e.aula).filter(Boolean))].sort();
  const hayPuntajes = estudiantes.some((e) => nivelDe(e) !== "pendiente");

  return (
    <>
      <h1>Dashboard de riesgo</h1>
      <p className="sub">Estudiantes ordenados de mayor a menor riesgo de abandono.</p>

      {/* HU-002: puntaje de riesgo de un estudiante */}
      <div className="panel">
        <div className="fila">
          <label className="campo">Consultar riesgo de un estudiante (número)
            <input
              type="number"
              min="1"
              value={idConsulta}
              onChange={(e) => setIdConsulta(e.target.value)}
              placeholder="Ej. 1"
            />
          </label>
          <button className="btn" onClick={consultarRiesgo} disabled={consultando}>
            {consultando ? "Calculando..." : "Ver riesgo"}
          </button>
        </div>

        {errorRiesgo && <div className="msg error">{errorRiesgo}</div>}

        {riesgo && (
          <div className="resumen">
            <div className="cuenta">Estudiante<b>{riesgo.id_estudiante}</b></div>
            <div className={`cuenta ${riesgo.nivel}`}>Nivel de riesgo<b>{riesgo.nivel}</b></div>
            <div className="cuenta">Puntaje<b>{riesgo.puntaje}</b></div>
            <div className="cuenta">
              Fecha de cálculo
              <b>{new Date(riesgo.fecha_calculo).toLocaleString("es-PE")}</b>
            </div>
          </div>
        )}

        {riesgo && riesgo.advertencia && (
          <div className="msg aviso">{riesgo.advertencia}</div>
        )}
      </div>

      <div className="resumen">
        <div className="cuenta alto">Riesgo alto<b>{contar("alto")}</b></div>
        <div className="cuenta medio">Riesgo medio<b>{contar("medio")}</b></div>
        <div className="cuenta bajo">Riesgo bajo<b>{contar("bajo")}</b></div>
        <div className="cuenta">Total estudiantes<b>{estudiantes.length}</b></div>
      </div>

      <div className="panel">
        <div className="fila">
          <label className="campo">Nivel de riesgo
            <select value={fRiesgo} onChange={(e) => setFRiesgo(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="alto">Alto</option>
              <option value="medio">Medio</option>
              <option value="bajo">Bajo</option>
            </select>
          </label>
          <label className="campo">Género
            <select value={fGenero} onChange={(e) => setFGenero(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </select>
          </label>
          <label className="campo"> Grado
            <select value={fGrado} onChange={(e) => setFGrado(e.target.value)}>
              <option value="todos">Todos</option>
              {grados.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">Aula
            <select value={fAula} onChange={(e) => setFAula(e.target.value)}>
              <option value="todos">Todos</option>
              {aulas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>

        {cargando && <div className="msg info">Cargando estudiantes...</div>}
        {error && <div className="msg error">{error}</div>}
        {!cargando && !error && estudiantes.length === 0 && (
          <div className="msg info">Todavía no hay estudiantes. Ve a "Cargar datos" para subir un archivo.</div>
        )}
        {!cargando && estudiantes.length > 0 && !hayPuntajes && (
          <div className="msg aviso">La lista con el nivel de riesgo de todos los estudiantes se conectará en HU-004.</div>
        )}
        {!cargando && hayPuntajes && contar("alto") === 0 && (
          <div className="msg ok">No hay casos de riesgo alto en el periodo actual.</div>
        )}
        {!cargando && estudiantes.length > 0 && filtrados.length === 0 && (
          <div className="msg info">No hay resultados para esos filtros.</div>
        )}

        {filtrados.length > 0 && (
          <div className="tabla-caja">
            <table>
              <thead>
                <tr>
                  <th>Código</th><th>Género</th><th>Grado</th><th>Aula</th><th>Asistencia</th><th>Promedio</th>
                  <th>Cursos desaprobados</th><th>Inasistencias seguidas</th><th>Riesgo</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id_estudiante}</td>
                    <td>{e.genero}</td>
                    <td>{e.grado}</td>
                    <td>{e.aula}</td>
                    <td>{e.asistencia}%</td>
                    <td>{e.promedio_academico}</td>
                    <td>{e.cursos_desaprobados}</td>
                    <td>{e.inasistencias_consecutivas}</td>
                    <td><span className={`riesgo ${nivelDe(e)}`}>{nivelDe(e) === "pendiente" ? "Sin calcular" : nivelDe(e)}</span></td>
                    <td><button className="btn btn-sec" onClick={() => onVerExplicacion(e)}>Ver explicación</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}