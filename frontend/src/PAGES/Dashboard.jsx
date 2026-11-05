import { useState, useEffect } from "react";
import axios from "axios";
import logo from "../assets/logo.png";

const colorRiesgo = {
  Bajo: { bg: "#1e4d2b", color: "#4ade80", barra: "#2e9e55" },
  Medio: { bg: "#5c4a12", color: "#facc15", barra: "#e0a500" },
  Alto: { bg: "#5c1f1a", color: "#f87171", barra: "#d9342b" },
};

function calcularRiesgo(e) {
  let puntos = 0;
  if (e.asistencia < 75) puntos += 2;
  if (e.cursos_desaprobados >= 2) puntos += 2;
  if (e.inasistencias_consecutivas >= 5) puntos += 2;
  if (e.promedio_academico < 12) puntos += 1;
  const score = Math.min(0.99, 0.3 + puntos * 0.12);
  if (puntos >= 4) return { nivel: "Alto", score };
  if (puntos >= 2) return { nivel: "Medio", score };
  return { nivel: "Bajo", score };
}

function Dashboard() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroRiesgo, setFiltroRiesgo] = useState("Todos");
  const [seleccionado, setSeleccionado] = useState(null);
  const [pagina, setPagina] = useState(1);
  const porPagina = 12;

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/estudiantes")
      .then((res) => {
        const conRiesgo = res.data.map((e) => ({ ...e, ...calcularRiesgo(e) }));
        setEstudiantes(conRiesgo);
        if (conRiesgo.length > 0) setSeleccionado(conRiesgo[0]);
      })
      .catch(() => setError("No se pudo conectar con el servidor."))
      .finally(() => setCargando(false));
  }, []);

  const niveles = ["Todos", "Alto", "Medio", "Bajo"];
  const conteo = { Bajo: 0, Medio: 0, Alto: 0 };
  estudiantes.forEach((e) => conteo[e.nivel]++);
  const total = estudiantes.length;

  const filtrados = estudiantes.filter(
    (e) => filtroRiesgo === "Todos" || e.nivel === filtroRiesgo
  );
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const mostrar = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div style={styles.pagina}>
      <div style={styles.navbar}>
        <img src={logo} alt="Sistema XAI" style={styles.navbarLogo} />
      </div>

      <div style={styles.contenedor}>
        {cargando && <p style={styles.subtitulo}>Cargando datos...</p>}
        {error && <p style={styles.errorMsg}>{error}</p>}

        {!cargando && !error && (
          <>
            {/* Tarjetas resumen */}
            <div style={styles.tarjetas}>
              <div style={styles.tarjeta}>
                <span style={styles.tarjetaLabel}>Estudiantes analizados</span>
                <span style={styles.tarjetaValor}>{total.toLocaleString()}</span>
                <span style={styles.tarjetaNota}>Dataset cargado</span>
              </div>
              <div style={styles.tarjeta}>
                <span style={styles.tarjetaLabel}>En riesgo alto</span>
                <span style={{ ...styles.tarjetaValor, color: "#f87171" }}>{conteo.Alto.toLocaleString()}</span>
                <span style={styles.tarjetaNota}>{total > 0 ? Math.round((conteo.Alto / total) * 100) : 0}% del total</span>
              </div>
              <div style={styles.tarjeta}>
                <span style={styles.tarjetaLabel}>Precisión del modelo</span>
                <span style={styles.tarjetaValor}>78.7%</span>
                <span style={styles.tarjetaNota}>XGBoost — PoC real</span>
              </div>
              <div style={styles.tarjeta}>
                <span style={styles.tarjetaLabel}>F1-score del modelo</span>
                <span style={styles.tarjetaValor}>73.0%</span>
                <span style={styles.tarjetaNota}>XGBoost — PoC real</span>
              </div>
            </div>

            {/* Filtros tipo pestaña */}
            <div style={styles.tabs}>
              {niveles.map((n) => (
                <button
                  key={n}
                  style={{ ...styles.tab, ...(filtroRiesgo === n ? styles.tabActivo : {}) }}
                  onClick={() => { setFiltroRiesgo(n); setPagina(1); }}
                >
                  {n.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={styles.layout}>
              {/* Tabla */}
              <div style={styles.panelTabla}>
                <table style={styles.tabla}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Estudiante</th>
                      <th style={styles.th}>Riesgo</th>
                      <th style={styles.th}>Inasistencias</th>
                      <th style={styles.th}>Promedio</th>
                      <th style={styles.th}>Nivel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mostrar.map((e) => (
                      <tr
                        key={e.id}
                        style={{ ...styles.fila, ...(seleccionado?.id === e.id ? styles.filaActiva : {}) }}
                        onClick={() => setSeleccionado(e)}
                      >
                        <td style={styles.td}>{e.id_estudiante}</td>
                        <td style={styles.td}>Estudiante {e.id_estudiante}</td>
                        <td style={styles.td}>{e.score.toFixed(2)}</td>
                        <td style={styles.td}>{e.inasistencias_consecutivas}</td>
                        <td style={styles.td}>{e.promedio_academico}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, backgroundColor: colorRiesgo[e.nivel].bg, color: colorRiesgo[e.nivel].color }}>
                            {e.nivel.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={styles.paginacion}>
                  <button style={styles.botonPag} disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>Anterior</button>
                  <span style={styles.paginaTexto}>Página {pagina} de {totalPaginas}</span>
                  <button style={styles.botonPag} disabled={pagina === totalPaginas} onClick={() => setPagina(pagina + 1)}>Siguiente</button>
                </div>
              </div>

              {/* Panel de detalle */}
              <div style={styles.panelDetalle}>
                <span style={styles.detalleLabel}>DETALLE</span>
                {seleccionado ? (
                  <>
                    <h3 style={styles.detalleTitulo}>Estudiante {seleccionado.id_estudiante}</h3>
                    <div style={styles.barraFondo}>
                      <div style={{ ...styles.barraRelleno, width: `${seleccionado.score * 100}%`, backgroundColor: colorRiesgo[seleccionado.nivel].barra }} />
                    </div>
                    <p style={styles.detalleRiesgo}>Riesgo: <strong>{seleccionado.score.toFixed(2)}</strong></p>

                    <span style={styles.formaLabel}>FACTORES</span>
                    <div style={styles.factor}>
                      <span style={styles.factorNombre}>Inasistencias consecutivas</span>
                      <div style={styles.barraFondoChica}>
                        <div style={{ ...styles.barraRellenoChica, width: `${Math.min(100, seleccionado.inasistencias_consecutivas * 10)}%` }} />
                      </div>
                    </div>
                    <div style={styles.factor}>
                      <span style={styles.factorNombre}>Promedio académico</span>
                      <div style={styles.barraFondoChica}>
                        <div style={{ ...styles.barraRellenoChica, width: `${Math.min(100, (20 - seleccionado.promedio_academico) * 6)}%` }} />
                      </div>
                    </div>
                    <div style={styles.factor}>
                      <span style={styles.factorNombre}>Cursos desaprobados</span>
                      <div style={styles.barraFondoChica}>
                        <div style={{ ...styles.barraRellenoChica, width: `${Math.min(100, seleccionado.cursos_desaprobados * 20)}%` }} />
                      </div>
                    </div>
                  </>
                ) : (
                  <p style={styles.subtitulo}>Selecciona un estudiante de la tabla.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  pagina: { minHeight: "100vh", backgroundColor: "#0f1b2d", fontFamily: "Segoe UI, sans-serif" },
  navbar: { backgroundColor: "#1e3a5f", padding: "12px 32px", display: "flex", alignItems: "center" },
  navbarLogo: { height: "40px" },
  contenedor: { maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" },
  subtitulo: { color: "#9aa7b8", fontSize: "14px" },
  errorMsg: { color: "#f87171", fontSize: "14px" },
  tarjetas: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" },
  tarjeta: { backgroundColor: "#15253d", borderRadius: "10px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "4px" },
  tarjetaLabel: { fontSize: "12px", color: "#9aa7b8" },
  tarjetaValor: { fontSize: "26px", fontWeight: 700, color: "#ffffff" },
  tarjetaNota: { fontSize: "11px", color: "#6b7a8f" },
  tabs: { display: "flex", gap: "8px", marginBottom: "16px" },
  tab: {
    padding: "8px 16px", borderRadius: "8px", border: "1px solid #2a3b55", backgroundColor: "#15253d",
    color: "#9aa7b8", fontSize: "12px", fontWeight: 600, cursor: "pointer",
  },
  tabActivo: { backgroundColor: "#1e3a5f", color: "#ffffff", borderColor: "#3a5a85" },
  layout: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", alignItems: "start" },
  panelTabla: { backgroundColor: "#15253d", borderRadius: "10px", padding: "12px", overflow: "hidden" },
  tabla: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: "11px", color: "#6b7a8f", textTransform: "uppercase", borderBottom: "1px solid #2a3b55" },
  fila: { cursor: "pointer" },
  filaActiva: { backgroundColor: "#1e3a5f" },
  td: { padding: "10px 12px", fontSize: "13px", color: "#e2e8f0", borderBottom: "1px solid #1c2c44" },
  badge: { padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700 },
  paginacion: { display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "14px" },
  botonPag: { padding: "6px 14px", borderRadius: "8px", border: "1px solid #2a3b55", backgroundColor: "#1e3a5f", color: "#e2e8f0", cursor: "pointer", fontSize: "12px" },
  paginaTexto: { fontSize: "12px", color: "#9aa7b8" },
  panelDetalle: { backgroundColor: "#15253d", borderRadius: "10px", padding: "18px" },
  detalleLabel: { fontSize: "11px", color: "#6b7a8f", letterSpacing: "1px" },
  detalleTitulo: { color: "#ffffff", margin: "4px 0 14px 0" },
  barraFondo: { width: "100%", height: "8px", backgroundColor: "#1c2c44", borderRadius: "999px", overflow: "hidden", marginBottom: "8px" },
  barraRelleno: { height: "100%", borderRadius: "999px" },
  detalleRiesgo: { color: "#e2e8f0", fontSize: "13px", marginBottom: "18px" },
  formaLabel: { fontSize: "11px", color: "#6b7a8f", letterSpacing: "1px", display: "block", marginBottom: "10px" },
  factor: { marginBottom: "12px" },
  factorNombre: { fontSize: "12px", color: "#9aa7b8", display: "block", marginBottom: "4px" },
  barraFondoChica: { width: "100%", height: "6px", backgroundColor: "#1c2c44", borderRadius: "999px", overflow: "hidden" },
  barraRellenoChica: { height: "100%", borderRadius: "999px", backgroundColor: "#f0693f" },
};

export default Dashboard;