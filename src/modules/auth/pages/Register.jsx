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
  
  // ✅ FUNCIÓN MEJORADA para validar entrada (con Ññ)
  const isValidNameInput = (value) => {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s'-]*$/.test(value);
  };

  // ✅ NUEVA FUNCIÓN para limpiar texto
  const cleanText = (text) => {
    return text
      .replace(/\s+/g, ' ')  // Reemplaza múltiples espacios por uno solo
      .trim();               // Elimina espacios al inicio y final
  };

  // ✅ NUEVA FUNCIÓN para capitalizar (maneja apostrofes y guiones)
  const capitalizeWords = (str) => {
    if (!str) return '';
    
    return str
      .split(' ')
      .map(word => {
        // Si la palabra contiene apostrofe, manejar cada parte por separado
        if (word.includes("'")) {
          return word
            .split("'")
            .map(part => {
              if (part.length === 0) return '';
              return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            })
            .join("'");
        }
        
        // Si la palabra contiene guión, manejar cada parte por separado
        if (word.includes('-')) {
          return word
            .split('-')
            .map(part => {
              if (part.length === 0) return '';
              return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            })
            .join('-');
        }
        
        // Palabra normal (esto manejará correctamente la ñ)
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({ 
    email: "", password: "", dni: "", general: "",
    firstName: "", lastName: "", middleName: ""
  });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateDNI = (dni) => /^\d{8}$/.test(dni);

  // ✅ NUEVA FUNCIÓN para manejar cambios en nombres (validación robusta)
  const handleNameInputChange = (setter, fieldName) => (e) => {
    let value = e.target.value;
    
    // 1-7. Todas las validaciones anteriores (sin cambios)
    const invalidChars = /[0-9!@#$%^&*()_+=[\]{};:"\\|,.<>/?`~]/;
    if (invalidChars.test(value)) return;
    if (/\s{2,}/.test(value)) return;
    if (/[-]{2,}/.test(value)) return;
    if (/[']{2,}/.test(value)) return;
    if (value.startsWith(' ') && value.length === 1) return;
    if (value.startsWith('-')) return;
    if (value.length > 50) return;
    if (!isValidNameInput(value)) return;
    
    setter(value);
    
    // ✅ VALIDACIÓN CORREGIDA: Solo cuando hay 5 o más caracteres iguales
    if (value.endsWith("'") || value.endsWith("-")) {
      setErrors(prev => ({ ...prev, [fieldName]: "No puede terminar con apóstrofe ni guion." }));
    } else if (/(.)\1{4,}/.test(value.trim())) {
      // (.)\1{4,} = 1 caracter original + 4 repeticiones = 5 total ✅
      setErrors(prev => ({ ...prev, [fieldName]: "No se permiten caracteres repetidos excesivamente." }));
    } else {
      // Limpiar errores si está válido
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        if (updated.general && updated.general.includes('Todos los campos son obligatorios')) {
          delete updated.general;
        }
        return updated;
      });
    }
  };

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
  };

  const handleSubmit = async () => {
    const newErrors = { dni: "", general: "" };
    let isValid = true;

    // ✅ PRIMERO verificar si TODOS están vacíos (INCLUYENDO DNI)
    const allFieldsEmpty = !firstName.trim() && !lastName.trim() && !middleName.trim() && !documentNumber.trim();
    
    if (allFieldsEmpty) {
      // Solo mostrar mensaje general cuando TODO está vacío
      newErrors.general = "Todos los campos son obligatorios.";
      setErrors(newErrors);
      return;
    }

    // ✅ Validaciones de nombres (sin cambios)
    if (!firstName.trim()) {
      newErrors.general = "Todos los campos son obligatorios.";
      isValid = false;
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = "Este campo debe tener al menos 2 caracteres";
      isValid = false;
    }

    if (!lastName.trim()) {
      newErrors.general = "Todos los campos son obligatorios.";
      isValid = false;
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = "Este campo debe tener al menos 2 caracteres";
      isValid = false;
    }

    if (!middleName.trim()) {
      newErrors.general = "Todos los campos son obligatorios.";
      isValid = false;
    } else if (middleName.trim().length < 2) {
      newErrors.middleName = "Este campo debe tener al menos 2 caracteres";
      isValid = false;
    }

    // ✅ Validaciones adicionales de nombres (sin cambios)
    if (firstName.trim().endsWith('-') || firstName.trim().endsWith("'")) {
      newErrors.firstName = "No puede terminar con apóstrofe ni guion.";
      isValid = false;
    }
    if (lastName.trim().endsWith('-') || lastName.trim().endsWith("'")) {
      newErrors.lastName = "No puede terminar con apóstrofe ni guion.";
      isValid = false;
    }
    if (middleName.trim().endsWith('-') || middleName.trim().endsWith("'")) {
      newErrors.middleName = "No puede terminar con apóstrofe ni guion.";
      isValid = false;
    }

    if (/(.)\1{4,}/.test(firstName.trim())) {
      newErrors.firstName = "No se permiten caracteres repetidos excesivamente.";
      isValid = false;
    }
    if (/(.)\1{4,}/.test(lastName.trim())) {
      newErrors.lastName = "No se permiten caracteres repetidos excesivamente.";
      isValid = false;
    }
    if (/(.)\1{4,}/.test(middleName.trim())) {
      newErrors.middleName = "No se permiten caracteres repetidos excesivamente.";
      isValid = false;
    }

    // ✅ VALIDACIÓN DEL DNI - CORREGIDA
    if (!documentNumber.trim()) {
      // Si el DNI está vacío Y otros campos tienen datos
      newErrors.general = "Todos los campos son obligatorios.";
      isValid = false;
    } else if (!validateDNI(documentNumber)) {
      // Si el DNI no tiene exactamente 8 dígitos (casos como "72")
      newErrors.dni = "El DNI debe tener 8 dígitos numéricos.";
      isValid = false;
    } else {
      // Solo verificar duplicado si el formato es correcto
      try {
        const response = await checkDni(documentNumber);
        if (response.exists === true) {
          newErrors.dni = "El DNI ya ha sido registrado.";
          isValid = false;
        }
      } catch (err) {
        newErrors.general = "Ocurrió un problema temporal al verificar tu DNI. Intenta nuevamente en unos momentos.";
        isValid = false;
      }
    }

    if (!isValid) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    // ✅ Activar loading para el registro final
    setLoading(true);

    // ✅ LIMPIAR Y CAPITALIZAR NOMBRES ANTES DE ENVIAR
    const cleanFirstName = cleanText(firstName);
    const cleanLastName = cleanText(lastName);
    const cleanMiddleName = cleanText(middleName);

    // Si todo es válido, se procede al registro del usuario
    const userData = {
      email,
      password,
      first_name: capitalizeWords(cleanFirstName),
      last_name: capitalizeWords(cleanLastName),
      middle_name: capitalizeWords(cleanMiddleName),
      document_number: documentNumber.trim(),
    };

    try {
      await registerUsuario(userData);
      
      // ✅ Simular tiempo de procesamiento adicional (4 segundos)
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      setSuccess(true);
    } catch (err) {
      // ✅ AGREGAR MÁS DETALLE PARA DEBUGGING
      console.error("❌ Error completo al registrar usuario:", err);
      console.error("❌ Respuesta del servidor:", err.response?.data);
      console.error("❌ Status del error:", err.response?.status);
      console.error("❌ Datos enviados:", userData);
      
      setErrors((prev) => ({
        ...prev,
        general: "Ocurrió un problema temporal al completar tu registro. Intenta nuevamente en unos momentos.",
      }));
    } finally {
      setLoading(false);
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
                      setFirstName(""); // Limpiar nombres
                      setLastName(""); // Limpiar apellido paterno
                      setMiddleName(""); // Limpiar apellido materno
                      setDocumentNumber(""); // Limpiar DNI
                      setErrors({ email: "", password: "", dni: "", general: "", firstName: "", lastName: "", middleName: "" });
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
                  onChange={handleNameInputChange(setFirstName, 'firstName')}
                  className={errors.firstName ? "input-error" : ""}
                  disabled={loading}
                />
                {errors.firstName && <div className="error-message">{errors.firstName}</div>}

                <label>Apellido paterno</label>
                <input
                  type="text"
                  placeholder="Apellido paterno"
                  value={lastName}
                  onChange={handleNameInputChange(setLastName, 'lastName')}
                  className={errors.lastName ? "input-error" : ""}
                  disabled={loading}
                />
                {errors.lastName && <div className="error-message">{errors.lastName}</div>}

                <label>Apellido materno</label>
                <input
                  type="text"
                  placeholder="Apellido materno"
                  value={middleName}
                  onChange={handleNameInputChange(setMiddleName, 'middleName')}
                  className={errors.middleName ? "input-error" : ""}
                  disabled={loading}
                />
                {errors.middleName && <div className="error-message">{errors.middleName}</div>}

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
