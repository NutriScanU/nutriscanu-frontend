import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../../styles/authTheme.css";

const API_URL = process.env.REACT_APP_API_URL;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codeLogin, setCodeLogin] = useState(""); // Para el código temporal
  const [isCodeLogin, setIsCodeLogin] = useState(false); // Determina si estamos en el flujo de código temporal
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
    code: "",
  });
  const [showCheck, setShowCheck] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  useEffect(() => {
    if (validateEmail(email)) {
      setShowCheck(true);
    } else {
      setShowCheck(false);
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = { email: "", password: "", general: "", code: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Campo requerido";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Por favor, ingresa un email válido.";
      isValid = false;
    }

    if (!password.trim() && !isCodeLogin) {
      newErrors.password = "Campo requerido";
      isValid = false;
    } else if (password.length < 6 && !isCodeLogin) {
      newErrors.password = "Tu contraseña debe tener al menos 6 caracteres.";
      isValid = false;
    }

    if (isCodeLogin && !codeLogin.trim()) {
      newErrors.code = "Campo requerido";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    try {
      let response;
      if (isCodeLogin) {
        response = await fetch(`${API_URL}/api/auth/login-with-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: codeLogin }),
        });
      } else {
        response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      }

      if (!response.ok) {
        setErrors((prev) => ({
          ...prev,
          general: "Usuario y/o contraseña incorrectos.",
        }));
        return;
      }

      const data = await response.json();
      const decoded = jwtDecode(data.token);

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", decoded.userId);

      if (decoded.role === "student") {
        navigate("/student/home");
      } else {
        alert("Tu cuenta no tiene permiso para acceder al perfil de estudiante.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Login fallido. Verifica tus datos o conexión.");
    }
  };

  const handleCodeLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/send-login-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        setErrors((prev) => ({
          ...prev,
          general: "Error al enviar el código de inicio de sesión.",
        }));
        return;
      }

      alert("Se ha enviado un código de inicio de sesión a tu correo.");
      setIsCodeLogin(true);
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Hubo un error al enviar el código.");
    }
  };

  return (
<div className="auth-wrapper">
  <div className="auth-background" />
  <div className="auth-overlay" />
  <div className="auth-card">
    <div className="auth-logo" onClick={() => navigate("/")}>NutriScanU</div>

    <h1>Bienvenido de vuelta</h1>
    <p>Qué bueno verte otra vez :)</p>

    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Correo</label>
      <div className="input-with-icon">
        <input
          id="email"
          type="text"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email || errors.general) {
              setErrors((prev) => ({ ...prev, email: "", general: "" }));
            }
          }}
          className={errors.email ? "input-error" : ""}
        />
        {showCheck && <span className="checkmark">✔</span>}
      </div>
      {errors.email && <div className="error-message">{errors.email}</div>}

      {!isCodeLogin && (
        <>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password || errors.general) {
                setErrors((prev) => ({ ...prev, password: "", general: "" }));
              }
            }}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
        </>
      )}

      {isCodeLogin && (
        <>
          <label htmlFor="code">Código de inicio de sesión</label>
          <input
            id="code"
            type="text"
            placeholder="Ingresa el código"
            value={codeLogin}
            onChange={(e) => setCodeLogin(e.target.value)}
            className={errors.code ? "input-error" : ""}
          />
          {errors.code && <div className="error-message">{errors.code}</div>}
        </>
      )}

      {errors.general && <div className="error-message general-error">{errors.general}</div>}

      <button type="submit">Iniciar sesión</button>

      <div className="center-or">
        <span>O</span>
      </div>

      {/* Botón usando div con accesibilidad */}
      <div
        className="login-code-button"
        onClick={handleCodeLogin}
        role="button"
        tabIndex={0}
        aria-label="Usar un código de inicio de sesión"
      >
        Usar un código de inicio de sesión
      </div>


    </form>
      {/* Enlace de contraseña */}
      {!isCodeLogin && (
        <span
          className="forgot-password-link"
          onClick={() => navigate("/forgot-password")}
          role="button"
          tabIndex={0}
          aria-label="Olvidaste la contraseña?"
        >
          ¿Olvidaste la contraseña?
        </span>
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
