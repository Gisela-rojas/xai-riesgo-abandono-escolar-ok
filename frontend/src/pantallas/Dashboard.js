
import { useEffect, useMemo, useState } from "react";
import { obtenerRiesgo } from "../api";

const URL_RIESGO_LOTE = "http://127.0.0.1:8000/estudiantes/riesgo";
const POR_PAGINA = 50;

const C = {
  navy: "#111B2D",
  blue: "#3B82F6",
  red: "#EF4444",
  orange: "#F59E0B",
  green: "#10B981",
  text: "#E8EEF8",
  muted: "#91A4BE",
  border: "#293B55",
  background: "#0B1220",
  white: "#151F32",
};

const colores = {
  alto: C.red,
  medio: C.orange,
  bajo: C.green,
  pendiente: "#94A3B8",
};

const card = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: "15px",
  padding: "21px",
  boxShadow: "0 5px 18px rgba(0,0,0,0.16)",
};

const etiqueta = {
  color: C.muted,
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: ".5px",
};

export function nivelDe(est) {
  const nivel = (est.nivel_riesgo || "").toLowerCase();
  if (nivel === "indeterminado") return "pendiente";
  return nivel || "pendiente";
}

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function porcentaje(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return "No disponible";
  return `${n.toFixed(1)}%`;
}

function Barra({ valor, color, alto = 9 }) {
  const ancho = Math.max(0, Math.min(100, numero(valor)));

  return (
    <div style={{
      height: `${alto}px`,
      width: "100%",
      background: "#293B55",
      borderRadius: "20px",
      overflow: "hidden",
    }}>
      <div style={{
        width: `${ancho}%`,
        height: "100%",
        background: color,
        borderRadius: "20px",
        transition: "width .4s ease",
      }} />
    </div>
  );
}

function TarjetaIndicador({ titulo, valor, detalle, color, icono }) {
  return (
    <div style={{
      ...card,
      borderTop: `4px solid ${color}`,
      minWidth: 0,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
      }}>
        <span style={{
          color: C.muted,
          fontSize: "13px",
          fontWeight: 600,
        }}>
          {titulo}
        </span>

        <span style={{
          width: "34px",
          height: "34px",
          display: "grid",
          placeItems: "center",
          borderRadius: "9px",
          background: `${color}20`,
          color,
          fontSize: "17px",
          fontWeight: 800,
        }}>
          {icono}
        </span>
      </div>

      <div style={{
        color,
        fontSize: "29px",
        fontWeight: 800,
        margin: "13px 0 5px",
        letterSpacing: "-.7px",
      }}>
        {valor}
      </div>

      <div style={{ color: C.muted, fontSize: "12px" }}>
        {detalle}
      </div>
    </div>
  );
}

function Campo({ titulo, children }) {
  return (
    <label style={{
      display: "flex",
      flexDirection: "column",
      gap: "7px",
      flex: "1",
      minWidth: "145px",
      color: C.text,
      fontSize: "12px",
      fontWeight: 700,
    }}>
      {titulo}
      {children}
    </label>
  );
}

const estiloControl = {
  width: "100%",
  minHeight: "40px",
  padding: "9px 11px",
  border: `1px solid ${C.border}`,
  borderRadius: "8px",
  background: "#1E2B40",
  color: C.text,
  fontSize: "13px",
  outline: "none",
};

function BotonSecundario({ children, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        background: disabled ? "#26364D" : "#1E2B40",
        color: disabled ? "#718096" : C.text,
        padding: "10px 15px",
        fontSize: "12px",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function Dashboard({ onVerExplicacion }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const [fRiesgo, setFRiesgo] = useState("todos");
  const [fGenero, setFGenero] = useState("todos");
  const [fGrado, setFGrado] = useState("todos");
  const [fAula, setFAula] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const [idConsulta, setIdConsulta] = useState("");
  const [riesgo, setRiesgo] = useState(null);
  const [errorRiesgo, setErrorRiesgo] = useState("");
  const [consultando, setConsultando] = useState(false);

  // Cargar resultados de predicción
  useEffect(() => {
    fetch(URL_RIESGO_LOTE)
      .then((r) => {
        if (!r.ok) {
          throw new Error(
            "No se pudo calcular el riesgo de los estudiantes."
          );
        }
        return r.json();
      })
      .then((datos) => {
        setResumen(datos.resumen);

        setEstudiantes(
          (datos.estudiantes || []).map((e) => ({
            ...e,
            id: e.id_estudiante,
            nivel_riesgo: e.nivel,
          }))
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  // Reiniciar paginación al cambiar filtros
  useEffect(() => {
    setPagina(1);
  }, [fRiesgo, fGenero, fGrado, fAula, busqueda]);

  // Consulta individual
  const consultarRiesgo = async () => {
    setRiesgo(null);
    setErrorRiesgo("");

    const id = parseInt(idConsulta, 10);

    if (Number.isNaN(id) || id <= 0) {
      setErrorRiesgo("Ingresa un código de estudiante válido.");
      return;
    }

    setConsultando(true);

    try {
      setRiesgo(await obtenerRiesgo(id));
    } catch (e) {
      setErrorRiesgo(e.message);
    } finally {
      setConsultando(false);
    }
  };

  // Filtros
  const limpiarFiltros = () => {
    setFRiesgo("todos");
    setFGenero("todos");
    setFGrado("todos");
    setFAula("todos");
    setBusqueda("");
  };

  const hayFiltros =
    fRiesgo !== "todos" ||
    fGenero !== "todos" ||
    fGrado !== "todos" ||
    fAula !== "todos" ||
    busqueda.trim() !== "";

  const filtrados = useMemo(() => {
    return estudiantes
      .filter((e) =>
        fRiesgo === "todos" || nivelDe(e) === fRiesgo
      )
      .filter((e) =>
        fGenero === "todos" ||
        (e.genero || "").toUpperCase() === fGenero
      )
      .filter((e) =>
        fGrado === "todos" || String(e.grado) === String(fGrado)
      )
      .filter((e) =>
        fAula === "todos" || String(e.aula) === String(fAula)
      )
      .filter((e) =>
        !busqueda.trim() ||
        String(e.id_estudiante) === busqueda.trim()
      );

  }, [
    estudiantes,
    fRiesgo,
    fGenero,
    fGrado,
    fAula,
    busqueda,
  ]);

  const grados = useMemo(
    () =>
      [...new Set(
        estudiantes.map((e) => e.grado).filter(Boolean)
      )].sort(),
    [estudiantes]
  );

  const aulas = useMemo(
    () =>
      [...new Set(
        estudiantes.map((e) => e.aula).filter(Boolean)
      )].sort(),
    [estudiantes]
  );

  // Paginación
  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);

  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  // Indicadores
  const cuenta = (nivel) =>
    resumen ? numero(resumen[nivel]) : 0;

  const total = estudiantes.length;

  const porcentajeNivel = (nivel) =>
    total > 0
      ? ((cuenta(nivel) / total) * 100).toFixed(1)
      : "0.0";

  const niveles = [
    { id: "alto", nombre: "Riesgo alto", color: C.red },
    { id: "medio", nombre: "Riesgo medio", color: C.orange },
    { id: "bajo", nombre: "Riesgo bajo", color: C.green },
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      color: C.text,
      padding: "20px",
      paddingBottom: "30px",
      background: C.background,
      borderRadius: "16px",
      minHeight: "100%",
    }}>

      {/* ENCABEZADO */}
      <header style={{
        background: "linear-gradient(115deg, #14243B, #1D4778)",
        color: "#FFFFFF",
        border: `1px solid ${C.border}`,
        borderRadius: "16px",
        padding: "25px",
        boxShadow: "0 7px 20px rgba(0,0,0,.2)",
      }}>
        <div style={{
          fontSize: "11px",
          color: "#93C5FD",
          fontWeight: 700,
          letterSpacing: "1.2px",
          marginBottom: "9px",
        }}>
          SISTEMA DE INTELIGENCIA ARTIFICIAL EXPLICABLE
        </div>

        <h1 style={{
          color: "#FFFFFF",
          fontSize: "25px",
          margin: "0 0 9px",
          lineHeight: 1.3,
        }}>
          Dashboard de riesgo de abandono escolar
        </h1>

        <p style={{
          color: "#C5D5E9",
          fontSize: "13px",
          lineHeight: 1.6,
          margin: 0,
          maxWidth: "750px",
        }}>
          Plataforma de focalización y análisis predictivo de estudiantes
          mediante XGBoost y explicabilidad basada en SHAP.
        </p>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "18px",
          marginTop: "22px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,.15)",
          fontSize: "12px",
          color: "#C5D5E9",
        }}>
          <span>● Modelo predictivo XGBoost</span>
          <span>● Explicabilidad SHAP</span>
          <span>● Análisis individual y grupal</span>
        </div>
      </header>

      {cargando && (
        <div style={card}>
          <div style={{ color: C.blue, fontWeight: 700 }}>
            Cargando resultados del modelo...
          </div>
          <p style={{ color: C.muted, fontSize: "13px" }}>
            Se están recuperando los resultados de evaluación de los estudiantes.
          </p>
        </div>
      )}

      {error && (
        <div style={{
          background: "#3A202A",
          color: "#FDA4AF",
          border: "1px solid #783B48",
          borderRadius: "9px",
          padding: "14px",
          fontSize: "13px",
        }}>
          {error}
        </div>
      )}

      {!cargando && !error && (
        <>
          {/* INDICADORES */}
          <section>
            <div style={{ marginBottom: "13px" }}>
              <div style={etiqueta}>VISTA GENERAL</div>
              <h2 style={{ fontSize: "19px", margin: "6px 0 0" }}>
                Resumen de estudiantes
              </h2>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "14px",
            }}>
              <TarjetaIndicador
                titulo="Total de estudiantes"
                valor={total.toLocaleString("es-PE")}
                detalle="Registros evaluados"
                color={C.blue}
                icono="▦"
              />

              <TarjetaIndicador
                titulo="Riesgo alto"
                valor={cuenta("alto").toLocaleString("es-PE")}
                detalle={`${porcentajeNivel("alto")}% del total`}
                color={C.red}
                icono="!"
              />

              <TarjetaIndicador
                titulo="Riesgo medio"
                valor={cuenta("medio").toLocaleString("es-PE")}
                detalle={`${porcentajeNivel("medio")}% del total`}
                color={C.orange}
                icono="◷"
              />

              <TarjetaIndicador
                titulo="Riesgo bajo"
                valor={cuenta("bajo").toLocaleString("es-PE")}
                detalle={`${porcentajeNivel("bajo")}% del total`}
                color={C.green}
                icono="✓"
              />
            </div>
          </section>

          {/* DISTRIBUCIÓN */}
          <section style={card}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "23px",
            }}>
              <div>
                <div style={etiqueta}>ANÁLISIS DE DISTRIBUCIÓN</div>
                <h2 style={{ fontSize: "18px", margin: "6px 0" }}>
                  Estudiantes por nivel de riesgo
                </h2>
                <p style={{
                  color: C.muted,
                  fontSize: "12px",
                  margin: 0,
                }}>
                  Distribución porcentual de las clasificaciones del modelo.
                </p>
              </div>

              <span style={{
                background: "#1E3A60",
                color: "#93C5FD",
                borderRadius: "8px",
                padding: "8px 11px",
                fontSize: "11px",
                fontWeight: 700,
              }}>
                DISTRIBUCIÓN GENERAL
              </span>
            </div>

            <div style={{
              display: "flex",
              height: "13px",
              width: "100%",
              borderRadius: "20px",
              overflow: "hidden",
              background: "#293B55",
              marginBottom: "24px",
            }}>
              {niveles.map((n) => (
                <div
                  key={n.id}
                  style={{
                    width: `${porcentajeNivel(n.id)}%`,
                    background: n.color,
                    transition: "width .4s ease",
                  }}
                  title={`${n.nombre}: ${porcentajeNivel(n.id)}%`}
                />
              ))}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "22px",
            }}>
              {niveles.map((n) => (
                <div key={n.id}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                    marginBottom: "9px",
                  }}>
                    <span style={{
                      fontSize: "13px",
                      fontWeight: 700,
                    }}>
                      {n.nombre}
                    </span>

                    <strong style={{
                      color: n.color,
                      fontSize: "13px",
                    }}>
                      {porcentajeNivel(n.id)}%
                    </strong>
                  </div>

                  <Barra
                    valor={porcentajeNivel(n.id)}
                    color={n.color}
                  />

                  <div style={{
                    color: C.muted,
                    fontSize: "12px",
                    marginTop: "8px",
                  }}>
                    {cuenta(n.id).toLocaleString("es-PE")} estudiantes
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CONSULTA INDIVIDUAL */}
          <section style={card}>
            <div style={etiqueta}>EVALUACIÓN INDIVIDUAL</div>

            <h2 style={{ fontSize: "18px", margin: "6px 0" }}>
              Consultar riesgo de un estudiante
            </h2>

            <p style={{
              color: C.muted,
              fontSize: "12px",
              margin: "0 0 17px",
            }}>
              Ingresa el código del estudiante para consultar su resultado predictivo.
            </p>

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              gap: "12px",
            }}>
              <Campo titulo="Código del estudiante">
                <input
                  type="number"
                  min="1"
                  value={idConsulta}
                  onChange={(e) => setIdConsulta(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") consultarRiesgo();
                  }}
                  placeholder="Ej. 1303"
                  style={estiloControl}
                />
              </Campo>

              <button
                onClick={consultarRiesgo}
                disabled={consultando}
                style={{
                  minHeight: "40px",
                  padding: "10px 20px",
                  background: C.blue,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: consultando ? "not-allowed" : "pointer",
                }}
              >
                {consultando ? "Consultando..." : "Consultar estudiante"}
              </button>
            </div>

            {errorRiesgo && (
              <div style={{
                marginTop: "14px",
                padding: "12px",
                background: "#3A202A",
                color: "#FDA4AF",
                borderRadius: "8px",
                fontSize: "12px",
              }}>
                {errorRiesgo}
              </div>
            )}

            {riesgo && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
                marginTop: "17px",
              }}>
                {[
                  {
                    titulo: "ESTUDIANTE",
                    valor: riesgo.id_estudiante,
                  },
                  {
                    titulo: "NIVEL DE RIESGO",
                    valor: riesgo.nivel || "No disponible",
                    color: colores[riesgo.nivel] || C.muted,
                  },
                  {
                    titulo: "PROBABILIDAD ESTIMADA",
                    valor: porcentaje(riesgo.puntaje),
                  },
                ].map((item) => (
                  <div key={item.titulo} style={{
                    background: "#19283D",
                    border: `1px solid ${C.border}`,
                    borderRadius: "10px",
                    padding: "15px",
                  }}>
                    <div style={etiqueta}>{item.titulo}</div>
                    <strong style={{
                      display: "block",
                      fontSize: "22px",
                      color: item.color || C.text,
                      marginTop: "7px",
                      textTransform: "capitalize",
                    }}>
                      {item.valor}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            {riesgo?.advertencia && (
              <div style={{
                marginTop: "12px",
                padding: "12px",
                background: "#3A3020",
                color: "#FCD34D",
                borderRadius: "8px",
                fontSize: "12px",
              }}>
                {riesgo.advertencia}
              </div>
            )}
          </section>

          {/* TABLA DE ESTUDIANTES */}
          <section style={card}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              alignItems: "flex-start",
              gap: "12px",
              marginBottom: "18px",
            }}>
              <div>
                <div style={etiqueta}>REGISTRO ACADÉMICO</div>
                <h2 style={{ fontSize: "18px", margin: "6px 0" }}>
                  Resultados de estudiantes
                </h2>
                <p style={{
                  color: C.muted,
                  fontSize: "12px",
                  margin: 0,
                }}>
                  Consulta y focaliza estudiantes según su nivel de riesgo.
                </p>
              </div>

              <span style={{
                background: "#1E3A60",
                color: "#93C5FD",
                padding: "8px 11px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 700,
              }}>
                {filtrados.length.toLocaleString("es-PE")} RESULTADOS
              </span>
            </div>

            {/* FILTROS */}
            <div style={{
              padding: "16px",
              background: "#101B2C",
              border: `1px solid ${C.border}`,
              borderRadius: "11px",
              marginBottom: "17px",
            }}>
              <div style={{
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "13px",
              }}>
                Filtros de búsqueda
              </div>

              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "flex-end",
              }}>
                <Campo titulo="Buscar código">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Código exacto. Ej. 50"
                    style={estiloControl}
                  />
                </Campo>

                <Campo titulo="Nivel de riesgo">
                  <select
                    value={fRiesgo}
                    onChange={(e) => setFRiesgo(e.target.value)}
                    style={estiloControl}
                  >
                    <option value="todos">Todos los niveles</option>
                    <option value="alto">Alto</option>
                    <option value="medio">Medio</option>
                    <option value="bajo">Bajo</option>
                    <option value="pendiente">Sin calcular</option>
                  </select>
                </Campo>

                <Campo titulo="Género">
                  <select
                    value={fGenero}
                    onChange={(e) => setFGenero(e.target.value)}
                    style={estiloControl}
                  >
                    <option value="todos">Todos</option>
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                  </select>
                </Campo>

                <Campo titulo="Grado">
                  <select
                    value={fGrado}
                    onChange={(e) => setFGrado(e.target.value)}
                    style={estiloControl}
                  >
                    <option value="todos">Todos</option>
                    {grados.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </Campo>

                <Campo titulo="Aula">
                  <select
                    value={fAula}
                    onChange={(e) => setFAula(e.target.value)}
                    style={estiloControl}
                  >
                    <option value="todos">Todas</option>
                    {aulas.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </Campo>

                {hayFiltros && (
                  <BotonSecundario onClick={limpiarFiltros}>
                    Limpiar filtros
                  </BotonSecundario>
                )}
              </div>
            </div>

            {filtrados.length === 0 ? (
              <div style={{
                background: "#19283D",
                color: C.muted,
                borderRadius: "9px",
                padding: "15px",
                fontSize: "13px",
              }}>
                No se encontraron estudiantes con los criterios seleccionados.
              </div>
            ) : (
              <>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "12px",
                  color: C.muted,
                  fontSize: "12px",
                }}>
                  <span>
                    Mostrando{" "}
                    <strong style={{ color: C.text }}>
                      {visibles.length}
                    </strong>{" "}
                    registros en esta página.
                  </span>

                  <span>
                    Página {paginaActual} de {totalPaginas}
                  </span>
                </div>

                <div style={{
                  width: "100%",
                  overflowX: "auto",
                  border: `1px solid ${C.border}`,
                  borderRadius: "10px",
                }}>
                  <table style={{
                    width: "100%",
                    minWidth: "1100px",
                    borderCollapse: "collapse",
                    fontSize: "12px",
                    textAlign: "left",
                    color: C.text,
                  }}>
                    <thead>
                      <tr style={{
                        background: "#1E2B40",
                        color: C.text,
                      }}>
                        {[
                          "Código",
                          "Género",
                          "Grado",
                          "Aula",
                          "Asistencia",
                          "Promedio",
                          "Desaprobados",
                          "Faltas seguidas",
                          "Probabilidad",
                          "Nivel de riesgo",
                          "Acción",
                        ].map((titulo) => (
                          <th key={titulo} style={{
                            padding: "14px 12px",
                            whiteSpace: "nowrap",
                            fontWeight: 700,
                            borderBottom: `1px solid ${C.border}`,
                          }}>
                            {titulo}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {visibles.map((e, index) => {
                        const nivel = nivelDe(e);
                        const valor = e.puntaje;

                        const disponible =
                          nivel !== "pendiente" &&
                          valor !== null &&
                          valor !== undefined &&
                          Number.isFinite(Number(valor));

                        return (
                          <tr
                            key={e.id}
                            style={{
                              background: index % 2 === 0
                                ? "#151F32"
                                : "#121D30",
                              borderBottom: `1px solid ${C.border}`,
                            }}
                          >
                            <td style={{
                              padding: "13px 12px",
                              fontWeight: 700,
                              color: "#93C5FD",
                            }}>
                              {e.id_estudiante}
                            </td>

                            <td style={{ padding: "13px 12px" }}>
                              {e.genero || "—"}
                            </td>

                            <td style={{ padding: "13px 12px" }}>
                              {e.grado || "—"}
                            </td>

                            <td style={{ padding: "13px 12px" }}>
                              {e.aula || "—"}
                            </td>

                            <td style={{ padding: "13px 12px" }}>
                              {e.asistencia ?? "—"}%
                            </td>

                            <td style={{ padding: "13px 12px" }}>
                              {e.promedio_academico ?? "—"}
                            </td>

                            <td style={{ padding: "13px 12px" }}>
                              {e.cursos_desaprobados ?? "—"}
                            </td>

                            <td style={{ padding: "13px 12px" }}>
                              {e.inasistencias_consecutivas ?? "—"}
                            </td>

                            <td style={{
                              padding: "13px 12px",
                              minWidth: "145px",
                            }}>
                              {disponible ? (
                                <div style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "7px",
                                }}>
                                  <strong style={{ color: colores[nivel] }}>
                                    {porcentaje(valor)}
                                  </strong>
                                  <Barra
                                    valor={valor}
                                    color={colores[nivel] || C.navy}
                                    alto={6}
                                  />
                                </div>
                              ) : (
                                <span style={{ color: C.muted }}>
                                  No disponible
                                </span>
                              )}
                            </td>

                            <td style={{ padding: "13px 12px" }}>
                              <span style={{
                                display: "inline-block",
                                color: colores[nivel],
                                background: `${colores[nivel]}20`,
                                borderRadius: "20px",
                                padding: "6px 10px",
                                fontSize: "11px",
                                fontWeight: 800,
                                textTransform: "capitalize",
                                whiteSpace: "nowrap",
                              }}>
                                {nivel === "pendiente" ? "Sin calcular" : nivel}
                              </span>
                            </td>

                            <td style={{ padding: "13px 12px" }}>
                              <button
                                onClick={() => onVerExplicacion(e)}
                                style={{
                                  background: C.blue,
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: "7px",
                                  padding: "9px 12px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Ver explicación →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINACIÓN */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                  marginTop: "18px",
                  flexWrap: "wrap",
                }}>
                  <BotonSecundario
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                  >
                    ← Anterior
                  </BotonSecundario>

                  <span style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: C.text,
                  }}>
                    Página {paginaActual} de {totalPaginas}
                  </span>

                  <BotonSecundario
                    onClick={() =>
                      setPagina((p) => Math.min(totalPaginas, p + 1))
                    }
                    disabled={paginaActual === totalPaginas}
                  >
                    Siguiente →
                  </BotonSecundario>
                </div>
              </>
            )}

            

          </section>
          
          

          {/* INTERPRETACIÓN GENERAL DE LOS RESULTADOS */}
          <section style={{
            ...card,
            borderTop: `4px solid ${C.blue}`,
          }}>
            <div style={etiqueta}>GUÍA DE INTERPRETACIÓN</div>

            <h2 style={{
              fontSize: "18px",
              margin: "7px 0 8px",
              color: C.text,
            }}>
              Interpretación general de los resultados
            </h2>

            <p style={{
              color: C.muted,
              fontSize: "13px",
              lineHeight: 1.7,
              margin: "0 0 18px",
            }}>
              Los niveles permiten identificar a los estudiantes que
              podrían necesitar acompañamiento y seguimiento oportuno.
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "13px",
            }}>

              {/* RIESGO ALTO */}
              <div style={{
                background: "#2B1D29",
                border: "1px solid #783B48",
                borderRadius: "11px",
                padding: "16px",
              }}>
                <strong style={{ color: C.red }}>
                  RIESGO ALTO
                </strong>

                <h2 style={{
                  color: "#FFFFFF",
                  fontSize: "25px",
                  margin: "8px 0",
                }}>
                  40% o más
                </h2>

                <p style={{
                  color: "#D6C2C8",
                  fontSize: "12px",
                  lineHeight: 1.6,
                }}>
                  Requiere atención prioritaria y revisión del caso
                  para considerar acciones de acompañamiento.
                </p>
              </div>

              {/* RIESGO MEDIO */}
              <div style={{
                background: "#30291D",
                border: "1px solid #76551F",
                borderRadius: "11px",
                padding: "16px",
              }}>
                <strong style={{ color: C.orange }}>
                  RIESGO MEDIO
                </strong>

                <h2 style={{
                  color: "#FFFFFF",
                  fontSize: "25px",
                  margin: "8px 0",
                }}>
                  25% a menos de 40%
                </h2>

                <p style={{
                  color: "#D8CDB9",
                  fontSize: "12px",
                  lineHeight: 1.6,
                }}>
                  Se recomienda seguimiento preventivo para observar
                  la evolución de los factores académicos.
                </p>
              </div>

              {/* RIESGO BAJO */}
              <div style={{
                background: "#192D2A",
                border: "1px solid #27634F",
                borderRadius: "11px",
                padding: "16px",
              }}>
                <strong style={{ color: C.green }}>
                  RIESGO BAJO
                </strong>

                <h2 style={{
                  color: "#FFFFFF",
                  fontSize: "25px",
                  margin: "8px 0",
                }}>
                  Menos de 25%
                </h2>

                <p style={{
                  color: "#C2D8D0",
                  fontSize: "12px",
                  lineHeight: 1.6,
                }}>
                  Puede continuar con el acompañamiento habitual.
                  Este nivel no significa que el riesgo sea inexistente.
                </p>
              </div>

            </div>

            {/* NOTA IMPORTANTE */}
            <div style={{
              marginTop: "17px",
              padding: "13px 15px",
              background: "#1E2B40",
              border: `1px solid ${C.border}`,
              borderRadius: "9px",
            }}>
              <p style={{
                color: C.muted,
                fontSize: "12px",
                lineHeight: 1.7,
                margin: 0,
              }}>
                <strong style={{ color: C.text }}>
                  Importante:
                </strong>{" "}
                la probabilidad mostrada es una estimación generada
                por el modelo predictivo. No representa una certeza
                de abandono escolar ni reemplaza la evaluación y el
                seguimiento del personal educativo.
              </p>
            </div>
          </section>


        </>
      )}
    </div>
  );
}
