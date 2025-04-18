import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    <div style={{ maxWidth: 450, margin: "auto", paddingTop: "4rem" }}>
      {!enviado ? (
        <>
          <h2>¿Olvidaste tu contraseña?</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 10, marginBottom: 10 }}
              required
            />
            <button type="submit" style={{ width: "100%", padding: 10 }}>
              Enviar enlace
            </button>
          </form>
        </>
      ) : (
        <>
          <h2>¡Listo!</h2>
          <p>
            Te acabamos de enviar un correo con las instrucciones a<br />
            <strong>{correoOculto}</strong>. Sigue las instrucciones para restablecer tu contraseña.
          </p>
          <button
            style={{ marginTop: "1rem", padding: 10, width: "100%" }}
            onClick={() => navigate("/login")}
          >
            Iniciar sesión
          </button>
        </>
      )}
    </div>
  );
}

export default ForgotPassword;
