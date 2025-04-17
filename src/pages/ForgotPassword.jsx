// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    const API_URL = process.env.REACT_APP_API_URL;
    if (!API_URL) {
      return setError("⚠️ REACT_APP_API_URL no está definida.");
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email,
      });

      const { obfuscatedEmail } = response.data;
      setMensaje(`✅ Te enviamos un correo a ${obfuscatedEmail}`);
    } catch (err) {
      console.error("❌ Error al enviar correo:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Hubo un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 450, margin: "auto", paddingTop: "4rem" }}>
      <h2>¿Olvidaste tu contraseña?</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
          required
        />
        {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
