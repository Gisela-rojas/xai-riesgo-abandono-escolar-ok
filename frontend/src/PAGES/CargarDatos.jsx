import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.png";

function CargarDatos() {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleArchivo = (e) => {
    setArchivo(e.target.files[0]);
    setMensaje("");
  };

  const handleCargar = async () => {
    if (!archivo) {
      setMensaje("Por favor selecciona un archivo primero.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);

    setCargando(true);
    setMensaje("");

    try {
      const respuesta = await axios.post(
        "http://127.0.0.1:8000/estudiantes/cargar",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (respuesta.data.exito) {
        setMensaje(`✅ Se guardaron ${respuesta.data.registros_guardados} estudiantes en la base de datos.`);
      } else {
        setMensaje(`⚠️ ${respuesta.data.error}`);
      }
    } catch (error) {
      setMensaje("❌ No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.pagina}>
      <div style={styles.navbar}>
        <img src={logo} alt="Sistema XAI" style={styles.navbarLogo} />
      </div>

      <div style={styles.contenedor}>
        <div style={styles.tarjeta}>
          <h2 style={styles.titulo}>Cargar datos de estudiantes</h2>
          <p style={styles.descripcion}>
            Sube un archivo CSV o Excel con: género, asistencia, promedio académico,
            cursos desaprobados, inasistencias consecutivas.
          </p>

          <label style={styles.labelArchivo}>
            <input type="file" accept=".csv, .xlsx" onChange={handleArchivo} style={{ display: "none" }} />
            {archivo ? archivo.name : "Seleccionar archivo"}
          </label>

          <button style={styles.boton} onClick={handleCargar} disabled={cargando}>
            {cargando ? "Cargando..." : "Cargar datos"}
          </button>

          {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pagina: { minHeight: "100vh", backgroundColor: "#eef1f4", fontFamily: "Segoe UI, sans-serif" },
  navbar: { backgroundColor: "#1e3a5f", padding: "12px 32px", display: "flex", alignItems: "center" },
  navbarLogo: { height: "40px" },
  contenedor: { display: "flex", justifyContent: "center", paddingTop: "60px" },
  tarjeta: {
    backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    padding: "36px 40px", width: "420px", borderTop: "4px solid #1e3a5f",
  },
  titulo: { color: "#1e3a5f", marginTop: 0, marginBottom: "12px" },
  descripcion: { color: "#5a6472", fontSize: "14px", lineHeight: "1.5", marginBottom: "24px" },
  labelArchivo: {
    display: "block", padding: "12px 16px", border: "1.5px dashed #8a97a8", borderRadius: "8px",
    color: "#5a6472", fontSize: "14px", cursor: "pointer", marginBottom: "20px", backgroundColor: "#f6f8fa",
  },
  boton: {
    backgroundColor: "#1e3a5f", color: "#ffffff", border: "none", padding: "12px 24px",
    borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", width: "100%",
  },
  mensaje: { marginTop: "18px", color: "#1e3a5f", fontSize: "13px", textAlign: "center" },
};

export default CargarDatos;