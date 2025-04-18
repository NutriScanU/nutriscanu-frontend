import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/authTheme.css";

function ForgotPassword() {
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
          .post("http://localhost:5000/api/auth/check-email", { email })
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

    if (!email) return setError("Campo requerido.");
    if (!validateEmail(email)) return setError("Por favor, ingresa un email válido.");
    if (emailExists === false) return setError("El correo no está registrado.");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setCorreoOculto(res.data.obfuscatedEmail);
      setEnviado(true);
    } catch (err) {
      setError("Hubo un error al enviar el correo.");
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

        {/* 🔙 Botón solo ícono tipo glass */}



        <div className="auth-logo" onClick={() => navigate("/")}>
          NutriScanU
        </div>

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

              <button type="submit">Enviar</button>
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
