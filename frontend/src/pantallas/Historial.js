import { useState } from "react";
import { obtenerRiesgo, obtenerHistorial, registrarIntervencion } from "../api";

// HU-008: Historial de predicciones e intervenciones
export default function Historial() {
  const [codigo, setCodigo] = useState("");
  const [idActual, setIdActual] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [fecha, setFecha] = useState("");
  const [texto, setTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorInt, setErrorInt] = useState("");
  const [okInt, setOkInt] = useState("");

  const cargar = async (id) => {
    const datos = await obtenerHistorial(id);
    setHistorial(datos);
    setIdActual(id);
  };

  const buscar = async () => {
    setError("");
    setOkInt("");
    setErrorInt("");
    setHistorial(null);
    setIdActual(null);

    const id = parseInt(codigo, 10);
    if (Number.isNaN(id) || id <= 0) {
      setError("Ingresa un código de estudiante válido.");
      return;
    }

    setCargando(true);
    try {
      await obtenerRiesgo(id); // confirma que el estudiante existe
      await cargar(id);
    } catch (e) {
      setError(e.message);
    }
    setCargando(false);
  };

  const registrar = async (e) => {
    e.preventDefault();
    setErrorInt("");
    setOkInt("");
    setGuardando(true);
    try {
      await registrarIntervencion(idActual, fecha, texto);
      await cargar(idActual);
      setFecha("");
      setTexto("");
      setOkInt("Intervención registrada.");
    } catch (err) {
      setErrorInt(err.message);
    }
    setGuardando(false);
  };

  const predicciones = historial ? historial.predicciones : [];
  const intervenciones = historial ? historial.intervenciones : [];

  return (
    <>
      <h1>Historial e intervenciones</h1>
      <p className="sub">Predicciones anteriores y acciones realizadas con cada estudiante.</p>

      <div className="panel">
        <div className="fila">
          <label className="campo">Código del estudiante
            <input
              type="number"
              min="1"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") buscar(); }}
              placeholder="Ej. 10"
            />
          </label>
          <button className="btn" onClick={buscar} disabled={cargando}>
            {cargando ? "Buscando..." : "Ver historial"}
          </button>
        </div>
        {error && <div className="msg error">{error}</div>}
      </div>

      {historial && (
        <>
          <div className="panel">
            <h3>Predicciones del estudiante {idActual}</h3>
            <p className="sub">
              Estado del seguimiento:{" "}
              <b>{intervenciones.length > 0 ? `Con seguimiento (${intervenciones.length})` : "Sin intervenciones"}</b>
            </p>

            {predicciones.length === 0 ? (
              <div className="msg info">Aún no existen predicciones registradas para este estudiante.</div>
            ) : (
              <div className="tabla-caja">
                <table>
                  <thead>
                    <tr><th>Fecha</th><th>Puntaje</th><th>Nivel</th><th>Explicación</th></tr>
                  </thead>
                  <tbody>
                    {predicciones.map((p) => (
                      <tr key={p.id}>
                        <td>{p.fecha ? new Date(p.fecha).toLocaleString("es-PE") : "—"}</td>
                        <td>{p.puntaje}%</td>
                        <td><span className={`riesgo ${p.nivel}`}>{p.nivel}</span></td>
                        <td>
                          {p.factores.length === 0
                            ? "—"
                            : p.factores.map((f) => `${f.nombre}: ${f.descripcion}`).join(" · ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="panel">
            <h3>Registrar intervención</h3>
            <form onSubmit={registrar}>
              <div className="fila">
                <label className="campo">Fecha
                  <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                </label>
                <label className="campo" style={{ flex: 1 }}>¿Qué se hizo?
                  <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Ej.: reunión con el apoderado"
                    required
                  />
                </label>
                <button className="btn" type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Registrar intervención"}
                </button>
              </div>
            </form>

            {errorInt && <div className="msg error">{errorInt}</div>}
            {okInt && <div className="msg ok">{okInt}</div>}

            {intervenciones.length === 0 ? (
              <p className="sub">Sin intervenciones registradas.</p>
            ) : (
              <div className="tabla-caja">
                <table>
                  <thead><tr><th>Fecha</th><th>Intervención</th></tr></thead>
                  <tbody>
                    {intervenciones.map((i) => (
                      <tr key={i.id}><td>{i.fecha}</td><td>{i.descripcion}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}