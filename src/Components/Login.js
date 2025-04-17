import React, { useState } from "react";
import { loginUsuario } from "../api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!email || !password) {
      setMensaje("Completa todos los campos");
      return;
    }

    try {
      const respuesta = await loginUsuario({
        email: email,
        password: password,
      });

      console.log("✅ Login correcto:", respuesta);

      const nombre =
        respuesta.nombre || respuesta.user?.nombre || "usuario";

      alert("Bienvenido " + nombre);

      // (Opcional) Guardar token
      // localStorage.setItem("token", respuesta.token);

    } catch (err) {
      console.error("❌ Error al hacer login:", err);
      setMensaje("Credenciales incorrectas o error del servidor");
    }
  };

  return (
    <div style={estilos.container}>
      <h2 style={estilos.titulo}>Iniciar Sesión</h2>

      <form onSubmit={handleSubmit} style={estilos.form}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={estilos.input}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={estilos.input}
        />

        {mensaje && <p style={estilos.error}>{mensaje}</p>}

        <button type="submit" style={estilos.boton}>Ingresar</button>
      </form>
    </div>
  );
}

const estilos = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "2rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  titulo: {
    fontSize: "24px",
    marginBottom: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.8rem",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #aaa",
  },
  boton: {
    padding: "0.8rem",
    fontSize: "16px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
};

export default Login;
