import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../../styles/authTheme.css";

const API_URL = process.env.REACT_APP_API_URL;

function ForgotPassword() {
  console.log("🔄 ForgotPassword component loaded"); // Debug para verificar carga
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [correoOculto, setCorreoOculto] = useState("");
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (validateEmail(email)) {
        setLoading(true);
        axios
          .post(`${API_URL}/api/auth/check-email`, { email })
          .then((res) => {
            setEmailExists(res.data.exists);
            setLoading(false);
          })
          .catch(() => {
            setEmailExists(false);
            setLoading(false);
          });
      } else {
        setEmailExists(null);
      }
    }, 600);
    return () => clearTimeout(delayDebounce);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones básicas
    if (!email.trim()) return setError("Campo requerido.");
    if (!validateEmail(email)) return setError("Por favor, ingresa un email válido.");
    
    // Solo bloquear si sabemos con certeza que el email NO existe
    // Si emailExists es null (problema de conexión), permitir continuar
    if (emailExists === false) {
      return setError("El correo no está registrado.");
    }

    setLoading(true);

    try {
      console.log("🔄 Enviando correo a:", email);
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      console.log("✅ Correo enviado exitosamente:", res.data);
      setCorreoOculto(res.data.obfuscatedEmail);
      setEnviado(true);
    } catch (err) {
      console.error("❌ Error completo:", err);
      console.error("❌ Response status:", err.response?.status);
      console.error("❌ Response data:", err.response?.data);
      
      // Mostrar mensaje de error específico según el tipo de error
      if (err.response?.status === 404) {
        setError("El correo no está registrado en nuestro sistema.");
      } else if (err.response?.status >= 500) {
        setError("Ocurrió un problema temporal en nuestros servidores. Intenta nuevamente en unos momentos.");
      } else if (!err.response) {
        // Error de red/conexión
        setError("Ocurrió un problema temporal de conexión. Intenta nuevamente en unos momentos.");
      } else {
        setError("Ocurrió un problema temporal al enviar el correo. Intenta nuevamente en unos momentos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-background" />
      <button
        className="btn-back-transparent"
        onClick={() => navigate("/login")}
        title="Volver al login"
      >
        ←
      </button>
      <div className="auth-overlay" />
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate("/")}>NutriScanU</div>

        {!enviado ? (
          <>
            <h1>Restablecer contraseña</h1>
            <p>Te enviaremos instrucciones a tu correo electrónico para restablecer tu contraseña.</p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Correo</label>
              <div className="input-with-icon">
                <input
                  id="email"
                  type="email"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={error ? "input-error" : ""}
                />
                {loading && <div className="loader" />}
                {emailExists && !loading && <span className="checkmark">✔</span>}
              </div>
              
              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar instrucciones"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>¡Enlace enviado!</h1>
            <p>
              Revisa tu bandeja de entrada <strong>({correoOculto})</strong> para continuar.
            </p>
            <button onClick={() => navigate("/login")}>Volver a inicio</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
