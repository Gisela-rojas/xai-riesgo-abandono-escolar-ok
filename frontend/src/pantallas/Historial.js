import { useEffect, useState } from "react";
import { obtenerEstudiantes } from "../api";

// HU-008: Historial de predicciones e intervenciones
export default function Historial() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [sel, setSel] = useState("");
  const [intervenciones, setIntervenciones] = useState({});
  const [texto, setTexto] = useState("");
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    obtenerEstudiantes().then(setEstudiantes).catch(() => setEstudiantes([]));
  }, []);

  const lista = intervenciones[sel] || [];

  const registrar = (e) => {
    e.preventDefault();
    setIntervenciones({ ...intervenciones, [sel]: [...lista, { fecha, texto }] });
    setTexto(""); setFecha("");
  };

  return (
    <>
      <h1>Historial e intervenciones</h1>
      <p className="sub">Predicciones anteriores y acciones realizadas con cada estudiante.</p>
      <div className="panel">
        <label className="campo">Estudiante
          <select value={sel} onChange={(e) => setSel(e.target.value)}>
            <option value="">Elige un estudiante</option>
            {estudiantes.map((e) => <option key={e.id} value={e.id}>{e.id_estudiante}</option>)}
          </select>
        </label>
      </div>

      {sel && (
        <>
          <div className="panel">
            <h3>Predicciones</h3>
            <div className="msg info">Aún no existen predicciones registradas para este estudiante.</div>
          </div>

          <div className="panel">
            <h3>Registrar intervención</h3>
            <form onSubmit={registrar}>
              <div className="fila">
                <label className="campo">Fecha
                  <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                </label>
                <label className="campo" style={{ flex: 1 }}>¿Qué se hizo?
                  <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ej.: reunión con el apoderado" required />
                </label>
                <button className="btn" type="submit">Registrar intervención</button>
              </div>
            </form>
            <div className="msg aviso">Por ahora se guarda solo en esta pantalla; falta conectarla a la base de datos.</div>
            {lista.length === 0 ? (
              <p className="sub">Sin intervenciones registradas.</p>
            ) : (
              <table>
                <thead><tr><th>Fecha</th><th>Intervención</th></tr></thead>
                <tbody>{lista.map((i, k) => <tr key={k}><td>{i.fecha}</td><td>{i.texto}</td></tr>)}</tbody>
              </table>
            )}
          </div>
        </>
      )}
    </>
  );
}
