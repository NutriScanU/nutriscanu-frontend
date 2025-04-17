import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUsuario } from "../services/authService";

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Paso 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Paso 2
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleNextStep = () => {
    if (!email || !password) {
      setMensaje("Completa el correo y la contraseña");
      return;
    }
    setMensaje("");
    setStep(2);
  };

  const handleSubmit = async () => {
    const userData = {
      email,
      password,
      confirm_password: password, // autollenado
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      document_number: documentNumber,
    };

    try {
      await registerUsuario(userData);
      alert("✅ Registro exitoso");
      navigate("/login");
    } catch (err) {
      console.error("❌ Error en el registro:", err);
      setMensaje("Error al registrar. Verifica los campos.");
    }
  };

  return (
    <div style={estilos.container}>
      <h2 style={estilos.titulo}>Crear cuenta</h2>

      {step === 1 && (
        <>
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

          <button onClick={handleNextStep} style={estilos.boton}>
            REGÍSTRATE
          </button>

          <p style={{ marginTop: "1rem" }}>
            ¿Ya tienes cuenta?{" "}
            <span style={estilos.link} onClick={() => navigate("/login")}>
              INICIAR SESIÓN
            </span>
          </p>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Nombres"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={estilos.input}
          />
          <input
            type="text"
            placeholder="Apellido paterno"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={estilos.input}
          />
          <input
            type="text"
            placeholder="Apellido materno"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            style={estilos.input}
          />
          <input
            type="text"
            placeholder="DNI"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            style={estilos.input}
          />

          {mensaje && <p style={estilos.error}>{mensaje}</p>}

          <button onClick={handleSubmit} style={estilos.boton}>
            Confirmar Registro
          </button>
        </>
      )}
    </div>
  );
}

const estilos = {
  container: {
    maxWidth: "400px",
    margin: "80px auto",
    padding: "2rem",
    border: "1px solid #ccc",
    borderRadius: "10px",
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  titulo: {
    fontSize: "24px",
    marginBottom: "1.5rem",
  },
  input: {
    width: "100%",
    padding: "0.8rem",
    fontSize: "16px",
    marginBottom: "1rem",
    borderRadius: "4px",
    border: "1px solid #aaa",
  },
  boton: {
    width: "100%",
    padding: "0.9rem",
    fontSize: "16px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
  link: {
    color: "#007bff",
    textDecoration: "underline",
    cursor: "pointer",
  },
};

export default Register;
