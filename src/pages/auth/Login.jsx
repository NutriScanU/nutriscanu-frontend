import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        alert("Correo o contraseña incorrectos");
        return;
      }

      const data = await response.json();
      const decoded = jwtDecode(data.token);

      console.log("✅ Token decodificado:", decoded);

      localStorage.setItem("token", data.token);

      // ✅ Si las credenciales son correctas y el usuario tiene el rol de "student",
      // redirige al perfil correspondiente de estudiante
      if (decoded.role === "estudiante") {
        navigate("/student/home");
      } else {
        alert("Tu cuenta no tiene permiso para acceder al perfil de estudiante.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Login fallido. Verifica tus datos.");
    }
  };

  return (
    <>
      <div className="login-background">
        <img
          src="https://storage.googleapis.com/a1aa/image/6d5e16bf-9f40-4ef1-f541-6dc7a3311dfe.jpg"
          alt="Fondo"
          className="login-background-image"
        />
        <div className="login-background-overlay" />
      </div>

      <div className="login-container">
        <div className="login-left">
          <h2>NutriscScanU</h2>
          <p>
            Puedes...<br />
            Detectar signos de anemia o diabetes en segundos.<br />
            Recibe recomendaciones de alimentos ideales para tu salud.
          </p>
        </div>

        <div className="login-right glass-banner">
          <h1>Bienvenido de vuelta</h1>
          <p>Qué bueno verte otra vez :)</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Correo</label>
              <input
                id="email"
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div
                className="forgot-password"
                onClick={() => navigate("/forgot-password")}
                style={{ cursor: "pointer" }}
            >
                ¿Olvidaste la contraseña?
            </div>


            <button type="submit">Inicia sesión</button>
          </form>

          <div className="login-footer">
            <span>¿Es la primera vez que usas NutriscScanU?</span>
            <span
              className="register-link"
              onClick={() => navigate("/register")}
            >
              Regístrate
            </span>

          </div>

          <div className="login-divider">
            <hr />
            <span>o</span>
            <hr />
          </div>

          <button className="admin-login-button">
            Inicia sesión con credencial de administrador
          </button>
        </div>
      </div>
    </>
  );
}

export default Login;
