import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/authTheme.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [correoOculto, setCorreoOculto] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setCorreoOculto(res.data.obfuscatedEmail);
      setEnviado(true);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al enviar el correo.");
    }
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-background" />
      <div className="forgot-overlay" />
      <div className="forgot-card">
        <button className="forgot-back" onClick={() => navigate("/login")}>
          ←
        </button>

        {!enviado ? (
          <>
            <h1>Restablecer contraseña</h1>
            <p>
              Te enviaremos instrucciones a tu correo electrónico de registro
              para restablecer tu contraseña
            </p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Correo</label>
              <input
                id="email"
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Enviar</button>
            </form>
          </>
        ) : (
          <>
            <h1>¡Enlace enviado!</h1>
            <p>
              Revisa tu bandeja de entrada ({correoOculto}) para continuar.
            </p>
            <button onClick={() => navigate("/login")}>Volver a inicio</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
