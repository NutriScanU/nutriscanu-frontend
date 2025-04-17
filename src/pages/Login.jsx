// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    try {
      const data = await loginUsuario({ email, password });
      localStorage.setItem("token", data.token);
      alert("Login exitoso");
      navigate("/perfil");
    } catch (error) {
      console.error(error);
      setMensaje("Correo o contraseña inválidos");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", paddingTop: "4rem" }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}
        <button type="submit" style={{ width: "100%", padding: 10 }}>
          Ingresar
        </button>
      </form>
    </div>
  );
}

export default Login;
