import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUsuario, checkDni } from "../services/authService";
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
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateDNI = (dni) => /^\d{8}$/.test(dni);

  const handleNextStep = async () => {
    const newErrors = { email: "", password: "", general: "" };
    let isValid = true;

    // ✅ PASO 1: Validaciones locales primero (sin backend)
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

    // ❌ Si hay errores de validación local, NO continuar con backend
    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    // ✅ PASO 2: Activar loading y deshabilitar todo
    setLoading(true);

    // ✅ PASO 3: Solo si todo está válido, verificar con backend
    try {
      const response = await axios.post(`${API_URL}/api/auth/check-email`, { email });

      // Si el correo ya está registrado
      if (response.data.exists === true) {
        newErrors.email = "El email ingresado ya se encuentra en uso";
        setErrors(newErrors);
        setLoading(false);
        return;
      }
    } catch (err) {
      // Solo mostrar error de sistema si es un error grave
      if (err.response?.status >= 500 || !err.response) {
        newErrors.general = "Ocurrió un problema temporal al verificar tu correo. Intenta nuevamente en unos momentos.";
        setErrors(newErrors);
        setLoading(false);
        return;
      }
      // Para otros errores (404, etc.), simplemente continuar
    }

    // ✅ PASO 4: Todo válido, simular procesamiento antes de avanzar
    setErrors({ email: "", password: "", general: "" });
    
    // Simular tiempo de procesamiento (4 segundos)
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    setStep(2);
    setLoading(false);
    setErrors({ email: "", password: "", general: "" });
    setStep(2);
  };

  const handleSubmit = async () => {
    const newErrors = { dni: "", general: "" };
    let isValid = true;

    // Validación de campos obligatorios (nombres, apellidos, etc.)
    if (!firstName.trim() || !lastName.trim() || !middleName.trim()) {
      newErrors.general = "Todos los campos son obligatorios.";
      isValid = false;
    }

    // Validación del formato del DNI
    if (!validateDNI(documentNumber)) {
      newErrors.dni = "El DNI debe tener 8 dígitos numéricos.";
      isValid = false;
    } else {
      // Verificar si el DNI ya está registrado
      try {
        const response = await checkDni(documentNumber);
        if (response.exists === true) {
          newErrors.dni = "El DNI ya ha sido registrado."; // Error si ya existe
          isValid = false;
        }
      } catch (err) {
        newErrors.general = "Ocurrió un problema temporal al verificar tu DNI. Intenta nuevamente en unos momentos."; // Error en caso de fallo de la consulta
        isValid = false;
      }
    }

    // Si los campos no son válidos, mostramos los errores y no seguimos con el registro
    if (!isValid) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    // ✅ Activar loading para el registro final
    setLoading(true);

    // Si todo es válido, se procede al registro del usuario
    const userData = {
      email,
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      middle_name: middleName.trim(),
      document_number: documentNumber.trim(),
    };

    try {
      await registerUsuario(userData); // Aquí se registra al usuario
      
      // ✅ Simular tiempo de procesamiento adicional (4 segundos)
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      setSuccess(true); // Si el registro es exitoso, mostramos el mensaje de éxito
    } catch (err) {
      console.error("❌ Error al registrar usuario:", err);
      setErrors((prev) => ({
        ...prev,
        general: "Ocurrió un problema temporal al completar tu registro. Intenta nuevamente en unos momentos.",
      }));
    } finally {
      setLoading(false); // Quitar loading al final
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
                  disabled={loading}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}

                <label htmlFor="password">Contraseña</label>
                <div className="input-with-icon">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      // Si el campo se vacía, resetear showPassword
                      if (e.target.value.length === 0) {
                        setShowPassword(false);
                      }
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    className={errors.password ? "input-error" : ""}
                    disabled={loading}
                  />
                  {password.length > 0 && (
                    <span
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ 
                        pointerEvents: loading ? 'none' : 'auto',
                        opacity: loading ? 0.5 : 1 
                      }}
                    >
                      {showPassword ? (
                        // SVG ojo cerrado (ocultar)
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14.12 14.12L9.88 9.88C8.73 8.73 8.73 6.87 9.88 5.72C11.03 4.57 12.89 4.57 14.04 5.72L14.12 14.12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9.9 4.24L14.1 8.44C15.19 9.53 15.19 11.27 14.1 12.36L9.9 16.56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10.73 5.08C11.15 5.03 11.57 5 12 5C17.52 5 22 12 22 12C21.27 13.18 20.43 14.24 19.5 15.17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.61 6.61C4.62 8.05 3.06 9.86 2 12C2 12 6.48 19 12 19C13.55 19 15.02 18.59 16.31 17.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        // SVG ojo abierto (mostrar)
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                  )}
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}

                {errors.general && <div className="error-message general-error">{errors.general}</div>}

                <button type="button" onClick={handleNextStep} disabled={loading}>
                  {loading ? (
                    <div className="loader-spinner small"></div>
                  ) : (
                    "Siguiente"
                  )}
                </button>

                <div className="auth-footer">
                  ¿Ya tienes una cuenta? 
                  <span 
                    onClick={() => !loading && navigate("/login")} 
                    style={{ 
                      opacity: loading ? 0.5 : 1, 
                      cursor: loading ? "not-allowed" : "pointer",
                      pointerEvents: loading ? "none" : "auto"
                    }}
                  >
                    Inicia sesión
                  </span>
                </div>
              </form>
            )}

            {step === 2 && (
              <form>
                {/* Botón de retroceso */}
                <button
                  className="back-button"
                  onClick={() => {
                    if (!loading) {
                      setStep(1);
                      setEmail(""); // Limpiar el correo
                      setPassword(""); // Limpiar la contraseña
                    }
                  }}
                  disabled={loading}
                  style={{
                    opacity: loading ? 0.5 : 1,
                    cursor: loading ? "not-allowed" : "pointer"
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
                {errors.dni && <div className="error-message">{errors.dni}</div>}
                {errors.general && <div className="error-message general-error">{errors.general}</div>}

                <button type="button" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <div className="loader-spinner small"></div>
                  ) : (
                    "Confirmar Registro"
                  )}
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
