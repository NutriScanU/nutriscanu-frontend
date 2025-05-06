const API_BASE = process.env.REACT_APP_API_URL;

// Manejo de errores general para reusar
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Error en la petición");
  }
  return data;
};

export async function loginUsuario(data) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function registerUsuario(data) {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function checkEmail(email) {
  const response = await fetch(`${API_BASE}/api/auth/check-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email }),
  });

  return handleResponse(response);
}
