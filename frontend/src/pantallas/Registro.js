import { useState } from "react";
import { API } from "../api";

export default function Registro({ irALogin }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [msg, setMsg] = useState(null);

  const registrar = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch(`${API}/usuarios/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, clave }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ tipo: "error", texto: data.detail || "No se pudo registrar. Quizá el correo ya existe." });
        return;
      }
      setMsg({ tipo: "ok", texto: "Cuenta creada. Ya puedes iniciar sesión." });
      setNombre(""); setCorreo(""); setClave("");
    } catch {
      setMsg({ tipo: "error", texto: "No hay conexión con el servidor. Revisa que el backend esté prendido." });
    }
  };

  return (
    <div className="acceso">
      <div className="panel">
        <h1>Crear cuenta</h1>
        <p className="sub">Registro de docentes y coordinación TOE</p>
        <form onSubmit={registrar}>
          <label className="campo">Nombre completo
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </label>
          <label className="campo">Correo
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          </label>
          <label className="campo">Contraseña
            <input type="password" minLength={6} value={clave} onChange={(e) => setClave(e.target.value)} required />
          </label>
          {msg && <div className={`msg ${msg.tipo}`}>{msg.texto}</div>}
          <button className="btn" type="submit">Crear cuenta</button>
        </form>
        <p>¿Ya tienes cuenta? <button className="enlace" onClick={irALogin}>Inicia sesión</button></p>
      </div>
    </div>
  );
}
