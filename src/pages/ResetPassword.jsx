// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ✅ Validaciones simples
    if (password.length < 6 || confirmPassword.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres.");
    }
    if (password !== confirmPassword) {
      return setError("Las contraseñas no coinciden.");
    }

    try {
      setLoading(true);

      // 🔍 Debug en consola
      const url = `${process.env.REACT_APP_API_URL}/api/auth/reset-password/${token}`;
      console.log("📦 Enviando solicitud a:", url);

      await axios.post(url, {
        new_password: password,
        confirm_password: confirmPassword,
      });

      setSuccess("¡Contraseña actualizada correctamente!");
      setTimeout(() => navigate("/login"), 2500);

    } catch (err) {
      console.error("❌ Error al resetear:", err);

      if (err.response) {
        console.error("🔍 Respuesta del backend:", err.response.data);
        setError(err.response.data?.error || "Error del servidor.");
      } else if (err.request) {
        setError("No se pudo conectar con el servidor.");
      } else {
        setError("Error inesperado: " + err.message);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", paddingTop: "4rem" }}>
      <h2>Cambia tu contraseña</h2>
      <p>Recuerda que debe tener 6 caracteres como mínimo</p>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
          required
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
          required
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <button
          type="submit"
          style={{ width: "100%", padding: 10 }}
          disabled={loading}
        >
          {loading ? "Procesando..." : "Cambiar"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
