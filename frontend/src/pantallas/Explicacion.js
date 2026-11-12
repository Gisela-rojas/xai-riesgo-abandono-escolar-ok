import { useEffect, useState } from "react";
import { nivelDe } from "./Dashboard";
import { enviarFeedback, obtenerExplicacion } from "../api";
 
// ==========================================
// PALETA DE COLORES - SISTEMA XAI DARK BLUE
// ==========================================
 
const C = {
  navy: "#FFFFFF",
  blue: "#60A5FA",
  red: "#F87171",
  green: "#34D399",
  orange: "#FBBF24",
 
  text: "#F1F5F9",
  muted: "#B8C7DB",
  border: "#344762",
 
  background: "#111D30",
  white: "#151F32",
  card: "#19283D",
  cardHover: "#20334D",
};
 
// ==========================================
// ESTILO DE TARJETAS
// ==========================================
 
const card = {
  background: C.white,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: "15px",
  padding: "22px",
  boxShadow: "0 5px 18px rgba(0,0,0,0.20)",
};
 
const label = {
  color: C.muted,
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: ".5px",
};
 
// ==========================================
// FORMATO DE PORCENTAJE
// ==========================================
 
function porcentaje(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : "No disponible";
}
 
// ==========================================
// TARJETA INDIVIDUAL DE FACTOR
// ==========================================
 
function FactorCard({ factor, maximo }) {
  const aporte = Number(factor.aporte);
 
  const valido = Number.isFinite(aporte);
  const positivo = aporte > 0;
  const negativo = aporte < 0;
 
  const color = positivo ? C.red : negativo ? C.green : C.muted;
 
  const ancho = valido
    ? Math.max(0, Math.min(100, (Math.abs(aporte) / (maximo || 1)) * 100))
    : 0;
 
  const fondoIcono = positivo ? "#48272F" : negativo ? "#153C35" : "#293B55";
 
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: "13px",
        padding: "19px",
        marginBottom: "13px",
      }}
    >
      {/* Nombre y peso del factor */}
 
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "15px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              flexShrink: 0,
              borderRadius: "9px",
              background: fondoIcono,
              color,
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: "18px",
            }}
          >
            {positivo ? "+" : negativo ? "−" : "•"}
          </div>
 
          <strong style={{ color: "#FFFFFF", fontSize: "15px", fontWeight: 700 }}>
            {factor.nombre}
          </strong>
        </div>
 
        <strong style={{ color, fontSize: "17px", fontWeight: 800 }}>
          {valido ? `${aporte > 0 ? "+" : ""}${aporte.toFixed(2)}` : "N/D"}
        </strong>
      </div>
 
      {/* Barra de peso */}
 
      <div
        style={{
          height: "10px",
          borderRadius: "20px",
          background: "#34445C",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${ancho}%`,
            height: "100%",
            background: color,
            borderRadius: "20px",
            transition: "width .4s ease",
          }}
        />
      </div>
 
      {/* Descripción */}
 
      <p
        style={{
          color: "#D5E2F2",
          fontSize: "14px",
          lineHeight: 1.7,
          margin: "14px 0 10px",
        }}
      >
        {factor.descripcion}
      </p>
 
      {/* Efecto sobre el riesgo */}
 
      <span
        style={{
          color,
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: ".3px",
        }}
      >
        {positivo ? "AUMENTA EL RIESGO" : negativo ? "REDUCE EL RIESGO" : "SIN EFECTO"}
      </span>
    </div>
  );
}
 
// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
 
export default function Explicacion({ estudiante, irADashboard }) {
  const [explicacion, setExplicacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorExp, setErrorExp] = useState("");
 
  const [feedback, setFeedback] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorFb, setErrorFb] = useState("");
 
  const idEstudiante = estudiante?.id_estudiante ?? null;
 
  // ========================================
  // CONSULTAR EXPLICACIÓN
  // ========================================
 
  useEffect(() => {
    if (idEstudiante === null) return;
 
    setExplicacion(null);
    setErrorExp("");
    setFeedback(false);
    setErrorFb("");
    setCargando(true);
 
    obtenerExplicacion(idEstudiante)
      .then(setExplicacion)
      .catch((e) => setErrorExp(e.message))
      .finally(() => setCargando(false));
  }, [idEstudiante]);
 
  // ========================================
  // SIN ESTUDIANTE SELECCIONADO
  // ========================================
 
  if (!estudiante) {
    return (
      <div style={{ ...card, padding: "30px" }}>
        <h1 style={{ color: "#FFFFFF", fontSize: "25px", marginTop: 0 }}>
          Explicación del riesgo
        </h1>
 
        <p style={{ color: C.muted, fontSize: "15px" }}>
          Selecciona un estudiante desde el Dashboard para consultar su
          explicación individual.
        </p>
 
        <button className="btn" onClick={irADashboard}>
          Ir al Dashboard
        </button>
      </div>
    );
  }
 
  // ========================================
  // DATOS DE LA EXPLICACIÓN
  // ========================================
 
  const factores = explicacion?.factores || [];
 
  const nivel = explicacion?.nivel || nivelDe(estudiante);
 
  const puntaje = explicacion?.puntaje ?? estudiante.puntaje;
 
  const colorNivel =
    {
      alto: C.red,
      medio: C.orange,
      bajo: C.green,
      pendiente: C.muted,
    }[nivel] || C.muted;
 
  const validos = factores.filter((f) => Number.isFinite(Number(f.aporte)));
 
  const maximo = Math.max(0, ...validos.map((f) => Math.abs(Number(f.aporte))));
 
  const positivos = validos.filter((f) => Number(f.aporte) > 0);
 
  const negativos = validos.filter((f) => Number(f.aporte) < 0);
 
  // ========================================
  // CARACTERÍSTICAS DEL ESTUDIANTE
  // ========================================
 
  const datos = [
    { nombre: "Asistencia", valor: `${estudiante.asistencia ?? "N/D"}%`, icono: "◷" },
    { nombre: "Promedio académico", valor: estudiante.promedio_academico ?? "N/D", icono: "▤" },
    { nombre: "Cursos desaprobados", valor: estudiante.cursos_desaprobados ?? "N/D", icono: "▦" },
    { nombre: "Inasistencias consecutivas", valor: estudiante.inasistencias_consecutivas ?? "N/D", icono: "◷" },
    { nombre: "Grado", valor: estudiante.grado || "N/D", icono: "⌂" },
    { nombre: "Aula", valor: estudiante.aula || "N/D", icono: "▣" },
  ];
 
  // ========================================
  // ENVIAR RETROALIMENTACIÓN
  // ========================================
 
  const reportar = async () => {
    setErrorFb("");
    setEnviando(true);
 
    try {
      await enviarFeedback(estudiante.id_estudiante, "Explicación no comprendida");
      setFeedback(true);
    } catch (e) {
      setErrorFb(e.message);
    } finally {
      setEnviando(false);
    }
  };
 
  // ========================================
  // INTERFAZ PRINCIPAL
  // ========================================
 
  return (
    <div
      style={{
        color: C.text,
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        paddingBottom: "25px",
      }}
    >
      {/* ENCABEZADO */}
 
      <div
        style={{
          background: "linear-gradient(115deg, #17365D, #28558B)",
          color: "#FFFFFF",
          border: "1px solid #3D628D",
          borderRadius: "16px",
          padding: "25px",
          boxShadow: "0 7px 20px rgba(0,0,0,.20)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "1.2px",
            color: "#D0E3FF",
            marginBottom: "9px",
          }}
        >
          ALERTA TEMPRANA DE ABANDONO ESCOLAR
        </div>
 
        <h1 style={{ color: "#FFFFFF", fontSize: "25px", margin: "0 0 8px" }}>
          Análisis individual del estudiante
        </h1>
 
        <p style={{ color: "#E0ECFA", fontSize: "14px", margin: 0 }}>
          Resultado del análisis de riesgo y los motivos que lo explican
        </p>
 
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "15px",
            marginTop: "23px",
            paddingTop: "17px",
            borderTop: "1px solid rgba(255,255,255,.25)",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", color: "#D0E3FF", fontWeight: 700 }}>
              CÓDIGO DEL ESTUDIANTE
            </span>
 
            <div
              style={{
                fontSize: "21px",
                fontWeight: 800,
                marginTop: "5px",
                color: "#FFFFFF",
              }}
            >
              {estudiante.id_estudiante}
            </div>
          </div>
 
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "11px", color: "#D0E3FF", fontWeight: 700 }}>
              NIVEL DE RIESGO
            </span>
 
            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                marginTop: "5px",
                color: "#FFFFFF",
                textTransform: "uppercase",
              }}
            >
              {nivel}
            </div>
          </div>
        </div>
      </div>
 
      {/* INDICADORES */}
 
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "14px",
        }}
      >
        <div style={card}>
          <div style={label}>RIESGO ESTIMADO</div>
 
          <div
            style={{
              fontSize: "30px",
              fontWeight: 800,
              color: "#FFFFFF",
              margin: "10px 0",
            }}
          >
            {porcentaje(puntaje)}
          </div>
 
          <div style={{ fontSize: "13px", color: C.muted }}>
            Qué tan probable es que abandone
          </div>
        </div>
 
        <div style={card}>
          <div style={label}>CLASIFICACIÓN DEL RIESGO</div>
 
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "12px 0",
            }}
          >
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: colorNivel,
              }}
            />
 
            <strong
              style={{
                fontSize: "23px",
                color: colorNivel,
                textTransform: "capitalize",
              }}
            >
              {nivel}
            </strong>
          </div>
 
          <div style={{ fontSize: "13px", color: C.muted }}>
            Categoría asignada por el sistema
          </div>
        </div>
 
        <div style={card}>
          <div style={label}>MOTIVOS PRINCIPALES</div>
 
          <div
            style={{
              fontSize: "30px",
              fontWeight: 800,
              color: "#FFFFFF",
              margin: "10px 0",
            }}
          >
            {factores.length}
          </div>
 
          <div style={{ fontSize: "13px", color: C.muted }}>
            Lo que más influye en su riesgo
          </div>
        </div>
      </div>
 
      {/* EXPLICACIÓN DEL RIESGO */}
 
      <section style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <div>
            <div style={label}>POR QUÉ TIENE ESTE RIESGO</div>
 
            <h2 style={{ color: "#FFFFFF", fontSize: "20px", margin: "8px 0" }}>
              Explicación del riesgo
            </h2>
          </div>
 
          <span
            style={{
              background: "#24466E",
              color: "#BFDBFE",
              border: "1px solid #42658D",
              borderRadius: "8px",
              padding: "9px 13px",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            En palabras simples
          </span>
        </div>
 
        <p style={{ color: "#C5D3E5", fontSize: "14px", lineHeight: 1.7 }}>
          Estos son los datos del estudiante que más pesan en su nivel de riesgo.
        </p>
 
        {cargando && (
          <div className="msg info">Calculando los motivos del riesgo...</div>
        )}
 
        {errorExp && <div className="msg error">{errorExp}</div>}
 
        {!cargando && !errorExp && factores.length === 0 && (
          <div className="msg aviso">
            No hay motivos disponibles para este estudiante.
          </div>
        )}
 
        {!cargando && !errorExp && validos.length > 0 && (
          <>
            {/* RESUMEN */}
 
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
                margin: "20px 0",
              }}
            >
              <div
                style={{
                  background: "#3A202A",
                  border: "1px solid #783B48",
                  borderRadius: "11px",
                  padding: "17px",
                }}
              >
                <div style={{ fontSize: "27px", fontWeight: 800, color: "#F87171" }}>
                  {positivos.length}
                </div>
 
                <div style={{ fontSize: "13px", color: "#FECACA" }}>
                  Factores que aumentan el riesgo
                </div>
              </div>
 
              <div
                style={{
                  background: "#12372F",
                  border: "1px solid #17664F",
                  borderRadius: "11px",
                  padding: "17px",
                }}
              >
                <div style={{ fontSize: "27px", fontWeight: 800, color: "#34D399" }}>
                  {negativos.length}
                </div>
 
                <div style={{ fontSize: "13px", color: "#A7F3D0" }}>
                  Factores que reducen el riesgo
                </div>
              </div>
            </div>
 
            {/* FACTORES */}
 
            <h3
              style={{
                color: "#FFFFFF",
                fontSize: "16px",
                margin: "22px 0 15px",
              }}
            >
              Cuánto pesa cada factor
            </h3>
 
            {validos.map((factor, i) => (
              <FactorCard
                key={`${factor.nombre}-${i}`}
                factor={factor}
                maximo={maximo}
              />
            ))}
 
            {/* LEYENDA */}
 
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                marginTop: "17px",
                fontSize: "13px",
              }}
            >
              <span style={{ color: C.red, fontWeight: 700 }}>
                ● Aumenta el riesgo
              </span>
 
              <span style={{ color: C.green, fontWeight: 700 }}>
                ● Reduce el riesgo
              </span>
            </div>
 
            <p
              style={{
                color: C.muted,
                fontSize: "12px",
                lineHeight: 1.7,
                marginTop: "16px",
              }}
            >
              Mientras más larga es la barra, más pesa ese factor en el nivel de
              riesgo del estudiante.
            </p>
          </>
        )}
      </section>
 
      {/* DATOS ACADÉMICOS */}
 
      <section style={card}>
        <div style={label}>INFORMACIÓN DEL ESTUDIANTE</div>
 
        <h2 style={{ color: "#FFFFFF", fontSize: "20px", margin: "8px 0 18px" }}>
          Características académicas
        </h2>
 
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
            gap: "12px",
          }}
        >
          {datos.map((d) => (
            <div
              key={d.nombre}
              style={{
                padding: "16px",
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: "11px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  marginBottom: "13px",
                }}
              >
                <span
                  style={{
                    color: "#BFDBFE",
                    background: "#24466E",
                    border: "1px solid #42658D",
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                  }}
                >
                  {d.icono}
                </span>
 
                <span style={{ ...label, letterSpacing: 0, color: "#B8C7DB" }}>
                  {d.nombre}
                </span>
              </div>
 
              <strong style={{ fontSize: "21px", color: "#FFFFFF" }}>
                {d.valor}
              </strong>
            </div>
          ))}
        </div>
      </section>
 
      {/* RETROALIMENTACIÓN */}
 
      <section style={{ ...card, background: "#19283D" }}>
        <h3 style={{ color: "#FFFFFF", fontSize: "17px", margin: "0 0 10px" }}>
          ¿Se entiende esta explicación?
        </h3>
 
        <p style={{ color: "#C5D3E5", fontSize: "14px", lineHeight: 1.7 }}>
          Si no resulta clara, avísanos para que el equipo la mejore.
        </p>
 
        {feedback ? (
          <div className="msg ok">
            Gracias. El caso quedó registrado para revisión del equipo.
          </div>
        ) : (
          <>
            <button className="btn btn-sec" onClick={reportar} disabled={enviando}>
              {enviando ? "Enviando..." : "No entendí esta explicación"}
            </button>
 
            {errorFb && <div className="msg error">{errorFb}</div>}
          </>
        )}
      </section>
 
      {/* VOLVER AL DASHBOARD */}
 
      <button
        className="btn"
        onClick={irADashboard}
        style={{ alignSelf: "flex-start", padding: "12px 20px" }}
      >
        ← Volver al Dashboard
      </button>
    </div>
  );
}