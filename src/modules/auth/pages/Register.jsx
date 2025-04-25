import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUsuario } from "../services/authService";
import axios from "axios";
import "../../../styles/authTheme.css";


function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  const [errors, setErrors] = useState({ email: "", password: "", general: "" });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleNextStep = async () => {
    const newErrors = { email: "", password: "", general: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Campo requerido";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Por favor, ingresa un email válido.";
      isValid = false;
    } else {
      try {
        const response = await axios.post("http://localhost:5000/api/auth/check-email", { email });
        if (response.data.exists === true) {
          newErrors.email = "El email ingresado ya se encuentra en uso";
          isValid = false;
        }
      } catch (err) {
        if (err.response?.status === 404 && err.response?.data?.exists === false) {
          // Permitir continuar
        } else {
          newErrors.general = "No se pudo verificar el correo.";
          isValid = false;
        }
      }
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

    setErrors({ email: "", password: "", general: "" });
    setStep(2);
  };

  const handleSubmit = async () => {
    const userData = {
      email,
      password,
      confirm_password: password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      middle_name: middleName.trim(),
      document_number: documentNumber.trim(),
    };

    try {
      await registerUsuario(userData);
      setSuccess(true);
    } catch (err) {
      console.error("❌ Error en el registro:", err);
      setErrors((prev) => ({ ...prev, general: "Error al registrar. Verifica los campos." }));
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-background" />
      <div className="auth-overlay" />
      <div className="auth-card">

        {success ? (
          <div className="register-success">
            <h2>✅ Usuario registrado correctamente</h2>
            <p>Tu cuenta ha sido creada con éxito.</p>
            <button onClick={() => navigate("/login")}>siguiente</button>
          </div>
        ) : (
          <>
            <h1 className="form-title">Crea tu cuenta</h1>
            <p className="form-subtitle">Empieza tu camino de aprendizaje</p>

            {step === 1 && (
              <form>
                <label htmlFor="email">Correo</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}

                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={errors.password ? "input-error" : ""}
                />
                {errors.password && <div className="error-message">{errors.password}</div>}

                {errors.general && <div className="error-message general-error">{errors.general}</div>}

                <button type="button" onClick={handleNextStep}>
                  Siguiente
                </button>

                <div className="auth-footer">
                  ¿Ya tienes una cuenta? <span onClick={() => navigate("/login")}>Inicia sesión</span>
                </div>
              </form>
            )}

            {step === 2 && (
              <form>
                <label>Nombres</label>
                <input
                  type="text"
                  placeholder="Nombres"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />

                <label>Apellido paterno</label>
                <input
                  type="text"
                  placeholder="Apellido paterno"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />

                <label>Apellido materno</label>
                <input
                  type="text"
                  placeholder="Apellido materno"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />

                <label>DNI</label>
                <input
                  type="text"
                  placeholder="DNI"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />

                {errors.general && <div className="error-message general-error">{errors.general}</div>}

                <button type="button" onClick={handleSubmit}>
                  Confirmar Registro
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
