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

export async function checkDni(document_number) {
  const response = await fetch(`${API_BASE}/api/auth/check-dni`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ document_number }),
  });

  return handleResponse(response);
}

export async function getUserProfile(token) {
  // Intentar primero el endpoint de auth
  try {
    const response = await fetch(`${API_BASE}/api/auth/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      return handleResponse(response);
    }
  } catch (error) {
    console.log("Auth profile endpoint not available, trying student endpoint...");
  }

  // Si no funciona, intentar con el endpoint de estudiantes
  try {
    const response = await fetch(`${API_BASE}/api/students/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    return handleResponse(response);
  } catch (error) {
    // Si tampoco funciona, intentar obtener datos básicos del usuario
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    return handleResponse(response);
  }
}
