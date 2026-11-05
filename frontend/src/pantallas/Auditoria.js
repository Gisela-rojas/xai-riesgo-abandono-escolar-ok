import { useState } from "react";

// HU-006: Auditoría de sesgo por subgrupos (género)
const UMBRAL = 5; // puntos porcentuales

export default function Auditoria() {
  const [resultado, setResultado] = useState(null);

  // Cuando el backend tenga la ruta de auditoría, aquí se llamará a la API.
  const ejecutar = () => setResultado({ disponible: false });

  return (
    <>
      <h1>Auditoría de sesgo</h1>
      <p className="sub">Compara el desempeño del modelo (F1) entre estudiantes mujeres y varones. La diferencia aceptable es de hasta {UMBRAL} puntos.</p>
      <div className="panel">
        <button className="btn" onClick={ejecutar}>Ejecutar auditoría</button>
        {resultado && !resultado.disponible && (
          <div className="msg aviso">El modelo todavía no está entrenado. La auditoría estará disponible cuando se conecte.</div>
        )}
        <div className="tabla-caja" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>Subgrupo</th><th>F1</th></tr></thead>
            <tbody>
              <tr><td>Femenino</td><td>—</td></tr>
              <tr><td>Masculino</td><td>—</td></tr>
              <tr><td><b>Diferencia</b></td><td>—</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
