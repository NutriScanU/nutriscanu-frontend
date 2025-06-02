import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUsuario } from "../services/authService";
import axios from "axios";
import "../../../styles/authTheme.css";

const API_URL = process.env.REACT_APP_API_URL;

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const onlyLetters = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({ email: "", password: "", dni: "", general: "" });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateDNI = (dni) => /^\d{8}$/.test(dni);

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
        const response = await axios.post(`${API_URL}/api/auth/check-email`, { email });

        // ✅ Si el correo ya está registrado
        if (response.data.exists === true) {
          newErrors.email = "El email ingresado ya se encuentra en uso";
          isValid = false;
        }
      } catch (err) {

        if (err.response?.status === 404) {
          // Nada que hacer, el correo está libre
        } else {
          newErrors.general = "No se pudo verificar el correo. Intenta más tarde.";
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

    // ✅ Todo válido: avanzar a paso 2
    setErrors({ email: "", password: "", general: "" });
    setStep(2);
  };

  const handleSubmit = async () => {
    const newErrors = { dni: "", general: "" };
    let isValid = true;

    if (!firstName.trim() || !lastName.trim() || !middleName.trim()) {
      newErrors.general = "Todos los campos son obligatorios.";
      isValid = false;
    }

    if (!validateDNI(documentNumber)) {
      newErrors.dni = "El DNI debe tener 8 dígitos numéricos.";
      isValid = false;
    }

    if (!isValid) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    const userData = {
      email,
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      middle_name: middleName.trim(),
      document_number: documentNumber.trim(),
    };

    try {
      await registerUsuario(userData);
      setSuccess(true);
    } catch (err) {

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
            <button onClick={() => navigate("/login")}>Ir a login</button>
          </div>
        ) : (
          <>
            <h1 className="form-title">Crea tu cuenta</h1>
            <p className="form-subtitle">Empezemos...</p>

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
                  type={showPassword ? "text" : "password"}
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
                {/* Botón de retroceso */}
                <button
                  className="back-button"
                  onClick={() => {
                    setEmail(""); // Limpiar el correo
                    setPassword(""); // Limpiar la contraseña
                  }}
                >
                  ←
                </button>

                <label>Nombres</label>
                <input
                  type="text"
                  placeholder="Nombres"
                  value={firstName}
                  onChange={(e) => {
                    if (onlyLetters(e.target.value)) {
                      setFirstName(e.target.value);
                      if (errors.general) setErrors(prev => ({ ...prev, general: "" }));
                    }
                  }}
                />

                <label>Apellido paterno</label>
                <input
                  type="text"
                  placeholder="Apellido paterno"
                  value={lastName}
                  onChange={(e) => {
                    if (onlyLetters(e.target.value)) {
                      setLastName(e.target.value);
                      if (errors.general) setErrors(prev => ({ ...prev, general: "" }));
                    }
                  }}
                />

                <label>Apellido materno</label>
                <input
                  type="text"
                  placeholder="Apellido materno"
                  value={middleName}
                  onChange={(e) => {
                    if (onlyLetters(e.target.value)) {
                      setMiddleName(e.target.value);
                      if (errors.general) setErrors(prev => ({ ...prev, general: "" }));
                    }
                  }}
                />

                <label>DNI</label>
                <input
                  type="text"
                  placeholder="DNI"
                  value={documentNumber}
                  onChange={(e) => {
                    const input = e.target.value.replace(/\D/g, "");
                    if (input.length <= 8) {
                      setDocumentNumber(input);
                      if (errors.dni) setErrors(prev => ({ ...prev, dni: "" }));
                      if (errors.general) setErrors(prev => ({ ...prev, general: "" }));
                    }
                  }}
                  className={errors.dni ? "input-error" : ""}
                />
                {errors.dni && <div className="error-message">{errors.dni}</div>}
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
