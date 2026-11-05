import { useState } from "react";
import { API } from "../api";

export default function Login({ onLogin, irARegistro }) {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  const entrar = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, clave }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.detail || "Correo o contraseña incorrectos.");
        return;
      }
      onLogin({ correo, nombre: data.nombre || data.usuario?.nombre });
    } catch {
      setError("No hay conexión con el servidor. Revisa que el backend esté prendido.");
    }
  };

  return (
    <div className="acceso">
      <div className="panel">
        <h1>Iniciar sesión</h1>
        <p className="sub">Sistema XAI de riesgo de abandono escolar</p>
        <form onSubmit={entrar}>
          <label className="campo">Correo
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          </label>
          <label className="campo">Contraseña
            <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} required />
          </label>
          {error && <div className="msg error">{error}</div>}
          <button className="btn" type="submit">Iniciar sesión</button>
        </form>
        <p>¿No tienes cuenta? <button className="enlace" onClick={irARegistro}>Regístrate</button></p>
      </div>
    </div>
  );
}
