// Dirección del backend (FastAPI)
export const API = "http://127.0.0.1:8000";

// Trae la lista de estudiantes del backend
export async function obtenerEstudiantes() {
  const res = await fetch(`${API}/estudiantes`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de estudiantes.");
  const data = await res.json();
  return Array.isArray(data) ? data : data.estudiantes || [];
}

// HU-001: envía el archivo CSV/Excel al backend para cargar los estudiantes
export async function cargarEstudiantes(archivo) {
  const formulario = new FormData();
  formulario.append("archivo", archivo);

  const res = await fetch(`${API}/estudiantes/cargar`, {
    method: "POST",
    body: formulario,
  });
  if (!res.ok) throw new Error("No se pudo conectar con el servidor.");

  // El backend responde { exito: true, registros_guardados: N }
  // o { exito: false, error: "mensaje" }
  return await res.json();
}

// HU-002: pide el puntaje de riesgo de un estudiante
export async function obtenerRiesgo(idEstudiante) {
  const res = await fetch(`${API}/estudiantes/${idEstudiante}/riesgo`);
  if (res.status === 404) throw new Error("Estudiante no encontrado.");
  if (!res.ok) throw new Error("No se pudo calcular el riesgo.");

  // Responde { id_estudiante, nivel, puntaje, fecha_calculo, advertencia }
  return await res.json();
}
// HU-003: reporta que una explicación no se comprendió
export async function enviarFeedback(idEstudiante, comentario) {
  const res = await fetch(`${API}/estudiantes/${idEstudiante}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comentario }),
  });
  if (!res.ok) throw new Error("No se pudo enviar el reporte.");
  return await res.json();
}
// HU-003: pide la explicación del riesgo de un estudiante
export async function obtenerExplicacion(idEstudiante) {
  const res = await fetch(`${API}/estudiantes/${idEstudiante}/explicacion`);
  if (!res.ok) throw new Error("No se pudo obtener la explicación.");
  return await res.json();
}