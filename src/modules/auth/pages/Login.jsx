import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../../styles/authTheme.css";

const API_URL = process.env.REACT_APP_API_URL;

function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState("default");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLoginWithPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateEmail(email)) return setErrors({ email: "Correo inválido" });
    if (!password) return setErrors({ password: "Contraseña requerida" });

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return setErrors({ general: "Credenciales incorrectas" });

      const data = await res.json();
      const decoded = jwtDecode(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", decoded.userId);

      if (decoded.role === "student") {
        navigate("/student/home");
      } else {
        alert("No tienes permiso para acceder.");
      }
    } catch (err) {
      alert("Error de red.");
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateEmail(email)) return setErrors({ email: "Correo inválido" });
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/send-login-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) return setErrors({ general: "Error al enviar el código" });

      setStep("enter-code");
    } catch (err) {
      alert("Error de red.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    if (code.some((digit) => digit.trim() === "")) {
      return setErrors({ code: "Código incompleto" });
    }
    const finalCode = code.join("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login-with-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: finalCode }),
      });

      if (!res.ok) return setErrors({ general: "Código incorrecto o expirado" });

      const data = await res.json();
      const decoded = jwtDecode(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", decoded.userId);

      if (decoded.role === "student") {
        navigate("/student/home");
      } else {
        alert("No tienes permiso para acceder.");
      }
    } catch (err) {
      alert("Error de red.");
    }
  };

  const handleCodeChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
    if (val && index < 4) inputRefs.current[index + 1]?.focus();
  };

  const handlePasteCode = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{5}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setCode(digits);
      inputRefs.current[4]?.focus();
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-login-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) return alert("Error al reenviar código.");
      alert("Código reenviado.");
    } catch {
      alert("Error de red.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-background" />
      <div className="auth-overlay" />
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate("/")}>NutriScanU</div>

        {step === "default" && (
          <>
            <h1>Bienvenido de vuelta</h1>
            <p>Qué bueno verte otra vez :)</p>
            <form onSubmit={handleLoginWithPassword}>
              <label>Correo</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              {errors.email && <div className="error-message">{errors.email}</div>}

              <label>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {errors.password && <div className="error-message">{errors.password}</div>}
              {errors.general && <div className="error-message">{errors.general}</div>}

              <button type="submit">Iniciar sesión</button>

              <div className="center-or"><span>O</span></div>
              <div className="login-code-button" onClick={() => setStep("send-code")}>Usar un código de inicio de sesión</div>
            </form>

            <span className="forgot-password-link" onClick={() => navigate("/forgot-password")}>¿Olvidaste la contraseña?</span>
          </>
        )}

        {step === "send-code" && (
          <>
            <h1>Ingresa tu correo</h1>
            <p>Te enviaremos un código para que accedas sin contraseña.</p>
            <form onSubmit={handleSendCode}>
              <label>Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              {errors.email && <div className="error-message">{errors.email}</div>}
              {errors.general && <div className="error-message">{errors.general}</div>}
              <button type="submit" disabled={loading} className="login-button">
                {loading ? <div className="spinner" /> : "Enviar código"}
              </button>
            </form>
            <div className="login-code-button" onClick={() => setStep("default")}>¿Usar contraseña?</div>
          </>
        )}

        {step === "enter-code" && (
          <>
            <h1>Ingresa el código que te acabamos de enviar</h1>
            <p>Enviamos un código a <strong>{email}</strong>. Válido por 15 minutos.</p>
            <form onSubmit={handleSubmitCode}>
              <div className="code-inputs" onPaste={handlePasteCode}>
                {code.map((c, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={c}
                    onChange={(e) => handleCodeChange(e, i)}
                    ref={(el) => inputRefs.current[i] = el}
                    style={{ width: "48px", height: "48px", fontSize: "24px", textAlign: "center", marginRight: i < 4 ? "10px" : "0", borderRadius: "6px" }}
                  />
                ))}
              </div>
              {errors.code && <div className="error-message">{errors.code}</div>}
              {errors.general && <div className="error-message">{errors.general}</div>}
              <button type="submit">Iniciar sesión</button>
            </form>
            <div className="login-code-button" onClick={() => setStep("default")}>Usar contraseña</div>
            <div className="login-code-button" onClick={handleResendCode}>Reenviar código</div>
          </>
        )}

        <div className="auth-footer">
          <text>¿Es la primera vez que usas NutriScanU?</text>
          <span onClick={() => navigate("/register")}> Regístrate</span>
        </div>
      </div>
    </div>
  );
}

export default Login;