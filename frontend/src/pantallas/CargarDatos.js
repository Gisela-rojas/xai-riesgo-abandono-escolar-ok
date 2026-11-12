
import { useRef, useState } from "react";
import { cargarEstudiantes } from "../api";

// HU-001: Cargar datos académicos y de asistencia (CSV/Excel)
const EXTENSIONES = [".csv", ".xlsx", ".xls"];

const C = {
  navy: "#111B2D",
  panel: "#151F32",
  input: "#1E2B40",
  blue: "#3B82F6",
  text: "#E8EEF8",
  muted: "#91A4BE",
  border: "#293B55",
  green: "#10B981",
  red: "#EF4444",
};

export default function CargarDatos() {
  const [archivo, setArchivo] = useState(null);
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(false);

  const inputRef = useRef(null);

  const seleccionarArchivo = (e) => {
    const seleccionado = e.target.files?.[0] || null;
    setArchivo(seleccionado);
    setMsg(null);
  };

  const cargar = async () => {
    setMsg(null);

    if (!archivo) {
      setMsg({
        tipo: "error",
        texto: "Selecciona un archivo primero.",
      });
      return;
    }

    const nombre = archivo.name.toLowerCase();

    if (!EXTENSIONES.some((ext) => nombre.endsWith(ext))) {
      setMsg({
        tipo: "error",
        texto: "Formato no soportado. Usa CSV o Excel (.csv, .xlsx, .xls).",
      });
      return;
    }

    setCargando(true);

    try {
      const data = await cargarEstudiantes(archivo);

      if (data.exito) {
        setMsg({
          tipo: "ok",
          texto: `Carga exitosa: ${data.registros_guardados} registros guardados.`,
        });
      } else {
        setMsg({
          tipo: "error",
          texto: data.error || "No se pudo cargar el archivo.",
        });
      }
    } catch {
      setMsg({
        tipo: "error",
        texto: "No hay conexión con el servidor. Revisa que el backend esté prendido.",
      });
    } finally {
      setCargando(false);
    }
  };

  const limpiarArchivo = () => {
    setArchivo(null);
    setMsg(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

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
      <header
        style={{
          background: "linear-gradient(115deg, #17365D, #28558B)",
          borderRadius: "15px",
          padding: "25px",
          boxShadow: "0 7px 20px rgba(0,0,0,.18)",
        }}
      >
        <div
          style={{
            color: "#BBD5F4",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "1.2px",
            marginBottom: "9px",
          }}
        >
          GESTIÓN DE INFORMACIÓN ACADÉMICA
        </div>

        <h1
          style={{
            color: "#FFFFFF",
            fontSize: "25px",
            margin: "0 0 9px",
          }}
        >
          Cargar datos de estudiantes
        </h1>

        <p
          style={{
            color: "#D8E5F5",
            fontSize: "13px",
            lineHeight: 1.7,
            margin: 0,
            maxWidth: "850px",
          }}
        >
          Importa los registros académicos y de asistencia para
          realizar el análisis predictivo del riesgo de abandono escolar.
        </p>
      </header>

      {/* PANEL DE CARGA */}
      <section
        style={{
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: "15px",
          padding: "24px",
          boxShadow: "0 5px 18px rgba(0,0,0,.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "#1E3A60",
              color: "#60A5FA",
              display: "grid",
              placeItems: "center",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            ↑
          </div>

          <div>
            <h2
              style={{
                fontSize: "17px",
                margin: 0,
                color: C.text,
              }}
            >
              Importación de archivos
            </h2>

            <p
              style={{
                color: C.muted,
                fontSize: "12px",
                margin: "5px 0 0",
              }}
            >
              Selecciona el archivo que contiene los datos de los estudiantes.
            </p>
          </div>
        </div>

        {/* ZONA DE SELECCIÓN */}
        <div
          onClick={() => !cargando && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();

            if (cargando) return;

            const archivoSoltado = e.dataTransfer.files?.[0];

            if (archivoSoltado) {
              setArchivo(archivoSoltado);
              setMsg(null);
            }
          }}
          style={{
            border: `1px dashed ${archivo ? C.blue : "#466181"}`,
            background: archivo ? "#172B46" : "#19283D",
            borderRadius: "12px",
            padding: "28px 18px",
            marginTop: "22px",
            textAlign: "center",
            cursor: cargando ? "not-allowed" : "pointer",
            transition: "all .2s ease",
          }}
        >
          <div
            style={{
              fontSize: "35px",
              color: "#60A5FA",
              marginBottom: "12px",
            }}
          >
            ▤
          </div>

          <strong
            style={{
              color: C.text,
              fontSize: "14px",
              display: "block",
              marginBottom: "7px",
            }}
          >
            {archivo
              ? "Archivo seleccionado"
              : "Selecciona o arrastra tu archivo aquí"}
          </strong>

          <span
            style={{
              color: C.muted,
              fontSize: "12px",
            }}
          >
            Formatos permitidos: CSV, XLSX y XLS
          </span>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={seleccionarArchivo}
            disabled={cargando}
            style={{ display: "none" }}
          />

          {archivo && (
            <div
              style={{
                background: "#213957",
                border: `1px solid ${C.border}`,
                borderRadius: "9px",
                padding: "12px",
                marginTop: "17px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                textAlign: "left",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <strong
                  style={{
                    display: "block",
                    color: "#93C5FD",
                    fontSize: "13px",
                    overflowWrap: "anywhere",
                  }}
                >
                  {archivo.name}
                </strong>

                <span
                  style={{
                    color: C.muted,
                    fontSize: "11px",
                  }}
                >
                  {(archivo.size / 1024).toFixed(1)} KB
                </span>
              </div>

              <button
                type="button"
                disabled={cargando}
                onClick={(e) => {
                  e.stopPropagation();
                  limpiarArchivo();
                }}
                style={{
                  border: "1px solid #526781",
                  background: "#19283D",
                  color: "#FCA5A5",
                  borderRadius: "7px",
                  padding: "7px 10px",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                Quitar
              </button>
            </div>
          )}
        </div>

        {/* BOTÓN DE CARGA */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "18px",
          }}
        >
          <button
            onClick={cargar}
            disabled={cargando}
            style={{
              background: cargando ? "#334B6A" : C.blue,
              color: "#FFFFFF",
              border: "none",
              borderRadius: "9px",
              padding: "12px 23px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: cargando ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(37,99,235,.2)",
            }}
          >
            {cargando ? "Procesando archivo..." : "↑  Cargar datos"}
          </button>
        </div>

        {/* MENSAJES */}
        {msg && (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "11px",
              padding: "14px",
              marginTop: "18px",
              borderRadius: "9px",
              background: msg.tipo === "ok" ? "#10352F" : "#3A202A",
              border: `1px solid ${
                msg.tipo === "ok" ? "#17664F" : "#783B48"
              }`,
              color: msg.tipo === "ok" ? "#6EE7B7" : "#FDA4AF",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >
            <strong>{msg.tipo === "ok" ? "✓" : "!"}</strong>
            <span>{msg.texto}</span>
          </div>
        )}
      </section>

      {/* INFORMACIÓN DE PRIVACIDAD */}
      <section
        style={{
          background: "#14283F",
          border: "1px solid #294766",
          borderRadius: "12px",
          padding: "19px",
          display: "flex",
          alignItems: "flex-start",
          gap: "13px",
        }}
      >
        <div
          style={{
            width: "35px",
            height: "35px",
            minWidth: "35px",
            display: "grid",
            placeItems: "center",
            borderRadius: "9px",
            background: "#1E3A60",
            color: "#60A5FA",
            fontSize: "17px",
          }}
        >
          ◈
        </div>

        <div>
          <strong
            style={{
              color: "#BFDBFE",
              fontSize: "13px",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Protección y privacidad de la información
          </strong>

          <p
            style={{
              color: "#A9BCD5",
              fontSize: "12px",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Privacidad (HU-007): cada estudiante se identifica mediante
            un código, sin nombres ni DNI.
          </p>
        </div>
      </section>

      {/* INFORMACIÓN DE COLUMNAS */}
      <section
        style={{
          background: "#111B2D",
          border: `1px solid ${C.border}`,
          borderRadius: "13px",
          padding: "20px",
        }}
      >
        <h3
          style={{
            color: C.text,
            fontSize: "14px",
            margin: "0 0 13px",
          }}
        >
          Estructura del archivo requerido
        </h3>

        <p
          style={{
            color: C.muted,
            fontSize: "12px",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          El archivo debe contener las columnas correspondientes a:
          código del estudiante, género, asistencia, promedio académico,
          cursos desaprobados, inasistencias consecutivas, rendimiento
          académico, grado y aula.
        </p>
      </section>
    </div>
  );
}
