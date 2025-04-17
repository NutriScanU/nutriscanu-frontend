// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6 || confirmPassword.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres.");
    }

    if (newPassword !== confirmPassword) {
      return setError("Las contraseñas no coinciden.");
    }

    const API_URL = process.env.REACT_APP_API_URL;
    if (!API_URL) {
      return setError("⚠️ REACT_APP_API_URL no está definida.");
    }

    try {
      await axios.post(`${API_URL}/api/auth/reset-password/${token}`, {
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccess("¡Contraseña actualizada correctamente!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("❌ Error:", err);
      if (err.response?.data?.error) {
        setError(`Error: ${err.response.data.error}`);
      } else {
        setError("Error inesperado. Intenta nuevamente.");
      }
    }
  };

  return (
    <div style={{ maxWidth: 450, margin: "auto", paddingTop: "4rem" }}>
      <h2>Cambia tu contraseña</h2>
      <p>Debe tener al menos 6 caracteres.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <button type="submit" style={{ width: "100%", padding: 10 }}>
          Cambiar
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
