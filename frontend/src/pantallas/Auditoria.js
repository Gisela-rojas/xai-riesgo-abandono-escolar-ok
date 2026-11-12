import { useState } from "react";
import { obtenerAuditoria } from "../api";

// HU-006: Auditoría de sesgo por subgrupos (género)
const UMBRAL = 5; // puntos porcentuales

export default function Auditoria() {
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const ejecutar = async () => {
    setResultado(null);
    setError("");
    setCargando(true);
    try {
      setResultado(await obtenerAuditoria());
    } catch (e) {
      setError(e.message);
    }
    setCargando(false);
  };

  const genero = resultado ? resultado.subgrupos.find((s) => s.atributo === "genero") : null;
  const aceptable = resultado && resultado.estado === "aceptable";

  return (
    <>
      <h1>Auditoría de sesgo</h1>
      <p className="sub">Compara el desempeño del modelo (F1) entre estudiantes mujeres y varones. La diferencia aceptable es de hasta {UMBRAL} puntos.</p>
      <div className="panel">
        <button className="btn" onClick={ejecutar} disabled={cargando}>
          {cargando ? "Auditando..." : "Ejecutar auditoría"}
        </button>

        {error && <div className="msg error">{error}</div>}

        {resultado && aceptable && (
          <div className="msg ok">
            Modelo aceptable: la diferencia entre grupos ({genero.diferencia_pp} puntos) está dentro del umbral de {resultado.umbral_pp} puntos.
          </div>
        )}
        {resultado && !aceptable && (
          <div className="msg error">
            Modelo bloqueado: la diferencia entre grupos ({genero.diferencia_pp} puntos) supera el umbral de {resultado.umbral_pp} puntos. Requiere revisión antes de usarse.
          </div>
        )}

        <div className="tabla-caja" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>Subgrupo</th><th>F1</th></tr></thead>
            <tbody>
              <tr><td>Femenino</td><td>{genero ? genero.f1_por_grupo.F : "—"}</td></tr>
              <tr><td>Masculino</td><td>{genero ? genero.f1_por_grupo.M : "—"}</td></tr>
              <tr><td><b>Diferencia</b></td><td>{genero ? `${genero.diferencia_pp} puntos` : "—"}</td></tr>
              <tr><td>F1 global</td><td>{resultado ? resultado.f1_global : "—"}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}