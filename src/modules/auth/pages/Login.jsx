import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../../styles/authTheme.css";

const API_URL = process.env.REACT_APP_API_URL;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
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
    const newErrors = { email: "", password: "", general: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Campo requerido";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Por favor, ingresa un email válido.";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Campo requerido";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Tu contraseña debe tener al menos 6 caracteres.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setErrors((prev) => ({
          ...prev,
          general: "Usuario y/o contraseña incorrectos.",
        }));
        return;
      }

      const data = await response.json();
      const decoded = jwtDecode(data.token);

      // 🔥 Guardamos correctamente
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", decoded.userId); 

      if (decoded.role === "estudiante") {
        navigate("/student/home");
      } else {
        alert("Tu cuenta no tiene permiso para acceder al perfil de estudiante.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Login fallido. Verifica tus datos o conexión.");
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
          {/* Correo */}
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

          {/* Contraseña */}
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

          <div className="forgot-link" onClick={() => navigate("/forgot-password")}>
            ¿Olvidaste la contraseña?
          </div>

          <button type="submit">Inicia sesión</button>

          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}
        </form>

        <div className="auth-footer">
          ¿Es la primera vez que usas NutriScanU? <span onClick={() => navigate("/register")}>Regístrate</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
