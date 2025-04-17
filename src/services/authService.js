// src/services/authService.js
const API_BASE = "http://localhost:5000";

export async function loginUsuario(data) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Error en login");

  return json;
}

export async function registerUsuario(data) {
  const response = await fetch(`http://localhost:5000/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Error al registrar");
  }

  return json;
}
