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
  const [confirmError, setConfirmError] = useState("");
  const [serverError, setServerError] = useState(""); // Para errores del servidor
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0); // Para la cuenta regresiva

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Activar loading desde el inicio
    setError("");
    setConfirmError("");
    setServerError(""); // Limpiar errores del servidor
    setSuccess("");

    let hasErrors = false;

    // ✅ PRIORIDAD 1: Validación de campos vacíos - CADA CAMPO POR SEPARADO
    if (!password.trim()) {
      setError("Completa este campo");
      hasErrors = true;
    }
    if (!confirmPassword.trim()) {
      setConfirmError("Completa este campo");
      hasErrors = true;
    }

    // Si hay campos vacíos, no continuar con otras validaciones
    if (hasErrors) {
      setLoading(false); // Desactivar loading si hay errores
      return;
    }

    // ✅ PRIORIDAD 2: Validación de longitud mínima (solo si no hay campos vacíos)
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      hasErrors = true;
    }
    
    // Validar también el campo de confirmación por separado
    if (confirmPassword.length < 6) {
      setConfirmError("La contraseña debe tener al menos 6 caracteres.");
      hasErrors = true;
    }

    // Si hay errores de longitud, no continuar
    if (hasErrors) {
      setLoading(false); // Desactivar loading si hay errores
      return;
    }

    // ✅ PRIORIDAD 3: Validación de coincidencia (solo si ambos tienen 6+ caracteres)
    if (password !== confirmPassword) {
      setServerError("Las contraseñas no coinciden");
      setLoading(false); // Desactivar loading si hay errores
      console.log("🔴 Estableciendo serverError:", "Las contraseñas no coinciden"); // Debug
      return;
    }

    // ✅ PRIORIDAD 4: Envío al servidor (solo si todo es válido)
    try {
      // Ya está en loading desde el inicio
      const url = `${process.env.REACT_APP_API_URL}/api/auth/reset-password/${token}`;
      console.log("📦 Enviando solicitud a:", url);

      await axios.post(url, {
        new_password: password,
        confirm_password: confirmPassword,
      });

      setSuccess("Tu contraseña ha sido actualizada correctamente");
      // Iniciar cuenta regresiva de 5 segundos
      setCountdown(5);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            navigate("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("❌ Error al resetear:", err);
      if (err.response) {
        console.error("🔍 Respuesta del backend:", err.response.data);
        // Mostrar mensaje específico si la nueva contraseña es igual a la anterior (409)
        if (err.response.status === 422 && err.response.data?.error) {
          setServerError(err.response.data.error);
        } else if (
          err.response.data?.error === "La nueva contraseña no debe ser igual a la que usaste anteriormente."
        ) {
          setServerError(err.response.data.error);
        } else if (err.response.status === 400 || err.response.status === 404) {
          setServerError("Token inválido o expirado");
        } else if (err.response.status === 500) {
          setServerError("Ocurrió un problema temporal. Intenta nuevamente en unos momentos.");
        } else {
          setServerError(err.response.data?.error || err.response.data?.message || "Ocurrió un problema temporal.");
        }
      } else if (err.request) {
        setServerError("Ocurrió un problema temporal de conexión. Intenta nuevamente en unos momentos.");
      } else {
        setServerError("Ocurrió un problema inesperado. Intenta nuevamente en unos momentos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-background" />
      <div className="auth-overlay" />
      <div className="auth-card">
        <h2>Cambia tu contraseña</h2>
        <p>Recuerda que debe tener 6 caracteres como mínimo</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(""); // Limpiar error al escribir
                if (serverError) setServerError(""); // Limpiar error del servidor al escribir
              }}
              style={{
                border: error ? "2px solid #ff4444" : "1px solid #ccc",
                padding: "10px",
                borderRadius: "5px",
                width: "100%",
                fontSize: "16px",
                boxSizing: "border-box",
                backgroundColor: (loading || success) ? "#f5f5f5" : "#fff",
                cursor: (loading || success) ? "not-allowed" : "text"
              }}
              disabled={loading || success}
            />
            {error && (
              <p style={{ 
                color: "#ff4444", 
                fontSize: "14px", 
                marginTop: "5px", 
                marginBottom: "0",
                fontWeight: "500" 
              }}>
                {error}
              </p>
            )}
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) setConfirmError(""); // Limpiar error al escribir
                if (serverError) setServerError(""); // Limpiar error del servidor al escribir
              }}
              style={{
                border: confirmError ? "2px solid #ff4444" : "1px solid #ccc",
                padding: "10px",
                borderRadius: "5px",
                width: "100%",
                fontSize: "16px",
                boxSizing: "border-box",
                backgroundColor: (loading || success) ? "#f5f5f5" : "#fff",
                cursor: (loading || success) ? "not-allowed" : "text"
              }}
              disabled={loading || success}
            />
            {confirmError && (
              <p style={{ 
                color: "#ff4444", 
                fontSize: "14px", 
                marginTop: "5px", 
                marginBottom: "0",
                fontWeight: "500" 
              }}>
                {confirmError}
              </p>
            )}
          </div>

          {success && (
            <p style={{ 
              color: "#28a745", 
              fontSize: "14px", 
              marginBottom: "15px",
              fontWeight: "500",
              textAlign: "center" 
            }}>
              {success}
            </p>
          )}

          {/* Error del servidor encima del botón */}
          {serverError && (
            <p style={{ 
              color: "#ff4444", 
              fontSize: "14px", 
              marginBottom: "15px",
              fontWeight: "500",
              textAlign: "center"
            }}>
              {serverError}
            </p>
          )}

          <button
            type="submit"
            style={{ width: "100%", padding: 10 }}
            disabled={loading || success}
          >
            {loading ? "Procesando..." : "Cambiar"}
          </button>

          {/* Mensaje de cuenta regresiva debajo del botón */}
          {success && countdown > 0 && (
            <p style={{ 
              color: "#f5f5f5", 
              fontSize: "16px", 
              marginTop: "20px",
              fontWeight: "600",
              textAlign: "center",
              animation: "breathe 1.5s ease-in-out infinite",
              textShadow: "0 1px 3px rgba(0,123,255,0.3)"
            }}>
              Se redirigirá a la pantalla de inicio principal, espera {countdown}
            </p>
          )}

          {/* Agregar los keyframes CSS para la animación de respiración */}
          <style jsx>{`
            @keyframes breathe {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
          `}</style>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
