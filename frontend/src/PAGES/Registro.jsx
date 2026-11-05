import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegistro = () => {
    if (!nombre || !correo || !clave) {
      setError("Completa todos los campos.");
      return;
    }
    // Por ahora simulado: no hay backend de registro todavía
    navigate("/login");
  };

  return (
    <div style={styles.pagina}>
      <div style={styles.navbar}>
        <img src={logo} alt="Sistema XAI" style={styles.navbarLogo} />
      </div>

      <div style={styles.contenedor}>
        <div style={styles.tarjeta}>
          <h2 style={styles.titulo}>Crear cuenta</h2>

          <input
            style={styles.input}
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Correo institucional"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
          />

          <button style={styles.boton} onClick={handleRegistro}>
            Registrarme
          </button>

          {error && <p style={styles.error}>{error}</p>}

          <p style={styles.link} onClick={() => navigate("/login")}>
            ¿Ya tienes cuenta? Inicia sesión
          </p>
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
    padding: "36px 40px", width: "360px", borderTop: "4px solid #1e3a5f",
  },
  titulo: { color: "#1e3a5f", marginTop: 0, marginBottom: "20px" },
  input: {
    display: "block", width: "100%", padding: "10px 12px", marginBottom: "14px",
    border: "1px solid #c7ced6", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box",
  },
  boton: {
    backgroundColor: "#1e3a5f", color: "#ffffff", border: "none", padding: "12px 24px",
    borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", width: "100%", marginTop: "6px",
  },
  error: { color: "#b3261e", fontSize: "13px", marginTop: "10px" },
  link: { color: "#1e3a5f", fontSize: "13px", marginTop: "18px", textAlign: "center", cursor: "pointer", textDecoration: "underline" },
};

export default Registro;