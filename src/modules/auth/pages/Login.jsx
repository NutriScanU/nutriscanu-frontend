import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getUserProfile } from "../services/authService";
import "../../../styles/authTheme.css";

const API_URL = process.env.REACT_APP_API_URL;

function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState("default");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [errors, setErrors] = useState({ email: "", password: "", general: "", code: "" });
  const [showCheck, setShowCheck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transitioningToCode, setTransitioningToCode] = useState(false);
  const [validatedEmail, setValidatedEmail] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const formatEmail = (email) => {
    const [username, domain] = email.split('@');  // Separar el nombre y el dominio
    const visibleUsername = username.substring(0, 2);  // Primeras dos letras del nombre
    const hiddenUsername = '*'.repeat(username.length - 2);  // Asteriscos para el resto del nombre
    return `${visibleUsername}${hiddenUsername}@${domain}`;  // Combinamos y retornamos el correo formateado
  };
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return setErrors({ ...errors, email: "Por favor, ingresa un email válido." });
    }

    setLoadingLogin(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.exists) {
        const sendResponse = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (sendResponse.ok) {
          setStep("success");
        } else {
          setErrors({ ...errors, general: "Ocurrió un problema temporal al enviar el correo. Intenta nuevamente en unos momentos." });
        }
      } else {
        setErrors(prev => ({
          ...prev,
          email: "El correo ingresado no está registrado. Por favor, ingresa un correo electrónico válido o regístrate.",
          general: ""
        }));
      }

    } catch (err) {
      console.error("❌ Error en forgot password:", err);
      setErrors({ ...errors, general: "Ocurrió un problema temporal al verificar tu correo. Intenta nuevamente en unos momentos." });
    } finally {
      setLoadingLogin(false);
    }
  };


  const [buttonLoading, setButtonLoading] = useState({
    backToPassword: false,
    resendCode: false,
    blockInputs: false
  });
  const inputRefs = useRef([]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    // Eliminado: el error se limpia directamente en handleCodeChange
  }, []);


  useEffect(() => {
    setErrors({ password: "", general: "", code: "" });
  }, [step]);


  useEffect(() => {
    setShowCheck(validateEmail(email));
  }, [email]);

  useEffect(() => {
    if (step === "enter-code") {
      const stored = sessionStorage.getItem("resendAttempts");
      setResendAttempts(stored ? parseInt(stored, 10) : 0);
    } else {
      sessionStorage.removeItem("resendAttempts");
    }
  }, [step]);


  // ✅ handleVerifyCode también debe usar validatedEmail
  const handleVerifyCode = async (e) => {
    e.preventDefault();

    const fullCode = code.join("");
    if (fullCode.length < 5 || code.some((digit) => digit.trim() === "")) {
      return setErrors((prev) => ({ ...prev, code: "Código incompleto" }));
    }
    if (!/^\d{5}$/.test(fullCode)) {
      return setErrors((prev) => ({ ...prev, code: "El código que digitó no es válido." }));
    }

    setButtonLoading(prev => ({ ...prev, blockInputs: true }));
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login-with-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: validatedEmail, code: fullCode }), // 🟢 cambio aquí
      });

      const data = await response.json();

      setTimeout(async () => {
        if (response.ok) {
          const decoded = jwtDecode(data.token);
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", decoded.userId);

          // 🔥 OBTENER DATOS COMPLETOS DEL USUARIO
          try {
            const userProfile = await getUserProfile(data.token);
            
            // Debug solo si hay problemas (comentar para producción limpia)
            // console.log("👤 User profile from API:", userProfile);
            
            localStorage.setItem("user", JSON.stringify(userProfile));
          } catch (profileError) {
            // Debug solo si hay problemas (comentar para producción limpia)
            // console.error("❌ Error getting user profile:", profileError);
            // console.log("🔍 Token decoded data:", decoded);
            
            // Fallback mejorado: usar todos los datos disponibles del token
            const fallbackUser = {
              id: decoded.userId || decoded.id,
              email: decoded.email || "",
              username: decoded.username || decoded.user || "",
              name: decoded.name || decoded.fullName || decoded.firstName || "",
              firstName: decoded.firstName || "",
              lastName: decoded.lastName || "",
              role: decoded.role || "student"
            };
            
            // Debug solo si hay problemas (comentar para producción limpia)
            // console.log("🔄 Using fallback user data:", fallbackUser);
            
            localStorage.setItem("user", JSON.stringify(fallbackUser));
          }

          if (decoded.role === "student") {
            navigate("/student/home");
          } else {
            alert("Tu cuenta no tiene permiso para acceder al perfil de estudiante.");
          }
        } else {
          setErrors(prev => ({ ...prev, code: data.message || "Código incorrecto o expirado" }));
        }
        setLoading(false);
        setButtonLoading(prev => ({ ...prev, blockInputs: false }));
      }, 2000);
    } catch (error) {
      setTimeout(() => {
        setErrors(prev => ({ ...prev, code: "Ocurrió un problema temporal. Intenta nuevamente en unos momentos." }));
        setLoading(false);
        setButtonLoading(prev => ({ ...prev, blockInputs: false }));
      }, 2000);
    }
  };



  const resetForm = () => {
    setEmail("");
    setPassword("");
    setCode(["", "", "", "", ""]);
    setErrors({ email: "", password: "", general: "", code: "" });
    setShowCheck(false);
    setValidatedEmail(""); // 🧼 Limpiar email validado
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = { email: "", password: "", general: "", code: "" };
    let isValid = true;

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

    if (!isValid) {
      setErrors(newErrors);
      return; // ❌ No seguimos si hay errores
    }

    setLoadingLogin(true); // ✅ Solo si todo es válido

    try {
      await new Promise((res) => setTimeout(res, 1000)); // Simula carga
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setErrors((prev) => ({ ...prev, general: "Correo y/o contraseña incorrectos." }));
        return;
      }

      const data = await response.json();
      const decoded = jwtDecode(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", decoded.userId);

      // 🔥 OBTENER DATOS COMPLETOS DEL USUARIO
      try {
        const userProfile = await getUserProfile(data.token);
        
        // Debug solo si hay problemas (comentar para producción limpia)
        // console.log("👤 User profile from API:", userProfile);
        
        localStorage.setItem("user", JSON.stringify(userProfile));
      } catch (profileError) {
        // Debug solo si hay problemas (comentar para producción limpia)
        // console.error("❌ Error getting user profile:", profileError);
        // console.log("🔍 Token decoded data:", decoded);
        
        // Fallback mejorado: usar todos los datos disponibles del token
        const fallbackUser = {
          id: decoded.userId || decoded.id,
          email: decoded.email || "",
          username: decoded.username || decoded.user || "",
          name: decoded.name || decoded.fullName || decoded.firstName || "",
          firstName: decoded.firstName || "",
          lastName: decoded.lastName || "",
          role: decoded.role || "student"
        };
        
        // Debug solo si hay problemas (comentar para producción limpia)
        // console.log("🔄 Using fallback user data:", fallbackUser);
        
        localStorage.setItem("user", JSON.stringify(fallbackUser));
      }

      if (decoded.role === "student") {
        navigate("/student/home");
      } else {
        alert("Tu cuenta no tiene permiso para acceder al perfil de estudiante.");
      }
    } catch (err) {
      console.error("❌ Error de conexión en login:", err);
      setErrors((prev) => ({ 
        ...prev, 
        general: "Ocurrió un problema temporal. Por favor, intenta nuevamente en unos momentos." 
      }));
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return setErrors({ ...errors, email: "Por favor, ingresa un email válido.", general: "" });
    }

    setLoadingLogin(true);
    setButtonLoading((prev) => ({ ...prev, blockInputs: true }));

    try {
      // ✅ Llamada corregida con POST
      const res = await fetch(`${API_URL}/api/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.exists) {
        setValidatedEmail(email); // 🔒 Guardar email validado

        await fetch(`${API_URL}/api/auth/send-login-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        setStep("enter-code");
        setErrors({ email: "", password: "", general: "", code: "" });
      } else if (!data.exists) {
        setErrors(prev => ({
          ...prev,
          email: "El correo ingresado no está registrado. Por favor, ingrese un correo electrónico válido o regístrese.",
          general: ""
        }));
      }

    } catch (err) {
      console.error("❌ Error en verificación de email:", err);
      setErrors(prev => ({
        ...prev,
        general: "Ocurrió un problema temporal al verificar tu correo. Intenta nuevamente en unos momentos.",
      }));
    } finally {
      setLoadingLogin(false);
      setButtonLoading((prev) => ({ ...prev, blockInputs: false }));
    }
  };


  const handleSubmitCode = async (e) => {
    e.preventDefault();
    if (code.some((digit) => digit.trim() === "")) {
      return setErrors({ code: "Código incompleto", general: "" });
    }

    const finalCode = code.join("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login-with-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: validatedEmail, code: finalCode }), // 🟢 cambio aquí
      });

      if (!res.ok) {
        return setErrors({ code: "", general: "Código o expirado" });
      }

      const data = await res.json();
      const decoded = jwtDecode(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", decoded.userId);

      if (decoded.role === "student") {
        navigate("/student/home");
      } else {
        alert("No tienes permiso para acceder.");
      }
    } catch (err) {
      console.error("❌ Error en validación de código:", err);
      setErrors({ 
        code: "", 
        general: "Ocurrió un problema temporal al validar tu código. Intenta nuevamente en unos momentos." 
      });
    }
  };

  const handleCodeChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
    // Limpiar el error al escribir en los inputs del código
    if (errors.code) {
      setErrors(prev => ({ ...prev, code: "" }));
    }
    if (val && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteCode = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{5}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setCode(digits);
      // Limpiar el error al pegar el código
      if (errors.code) {
        setErrors(prev => ({ ...prev, code: "" }));
      }
      digits.forEach((digit, i) => {
        if (inputRefs.current[i]) inputRefs.current[i].value = digit;
      });
      inputRefs.current[4]?.focus();
    }
  };

  return (
    <div className="auth-wrapper">
      <header className="auth-header">
        <div className="auth-header-container">
          {/* Logo alineado a la izquierda */}
          <div className="auth-logo" onClick={() => navigate("/")}>
            NutriScanU
          </div>

          {/* Botón de "Iniciar sesión" en la esquina derecha solo cuando esté en "Olvidaste la contraseña" */}
          {isForgotPassword && (
            <button
              className="login-button-right"
              onClick={() => {
                setIsForgotPassword(false); // Cambiar a login principal
                setStep("default");
              }}
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </header>
      <div className="auth-background" />
      <div className="auth-overlay" />
      <div className="auth-card">
        {/* <div className="auth-logo" onClick={() => navigate("/")}>NutriScanU</div> */}

        {/* Formulario de inicio de sesión */}
        {step === "default" && (
          <form onSubmit={handleLogin}>
            <h1>Bienvenido de vuelta :)</h1>
            {/* Correo */}
            <label htmlFor="email">Correo</label>
            <div className="input-with-icon">
              <input
                id="email"
                type="text"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Limpiar los errores cuando el usuario empieza a escribir
                  if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                  if (errors.general) setErrors(prev => ({ ...prev, general: "" }));
                }}
                className={errors.email ? "input-error" : ""}
                disabled={loadingLogin || transitioningToCode}
              />
              {showCheck && <span className="checkmark">✔</span>}
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}

            {/* Contraseña */}
            <label htmlFor="password">Contraseña</label>
            <div className="input-with-icon">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Si el campo se vacía, resetear showPassword
                  if (e.target.value.length === 0) {
                    setShowPassword(false);
                  }
                  // Limpiar los errores cuando el usuario empieza a escribir
                  if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                  if (errors.general) setErrors(prev => ({ ...prev, general: "" }));
                }}
                className={errors.password ? "input-error" : ""}
                disabled={loadingLogin || transitioningToCode}
              />
              {password.length > 0 && (
                <span
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    pointerEvents: (loadingLogin || transitioningToCode) ? 'none' : 'auto',
                    opacity: (loadingLogin || transitioningToCode) ? 0.5 : 1 
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

            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              disabled={loadingLogin || transitioningToCode}
              className="login-button"
            >
              {loadingLogin ? <div className="loader-spinner" /> : "Iniciar sesión"}
            </button>

            {/* Opción para usar código de inicio de sesión */}
            <div className="center-or"><span>O</span></div>
            <div
              className={`login-code-button ${loadingLogin || transitioningToCode ? "disabled" : ""}`}
              onClick={() => {
                // Guardar el correo en sessionStorage

                if (!loadingLogin && !transitioningToCode) {
                  setTransitioningToCode(true);
                  setTimeout(() => {
                    resetForm();
                    setStep("send-code"); // Pasamos al paso de enviar el código
                    setTransitioningToCode(false);
                  }, 800);
                }
              }}
            >
              {transitioningToCode ? <div className="loader-spinner small" /> : "Usar un código de inicio de sesión"}
            </div>

            {/* Enlace para la recuperación de contraseña */}
            <div>
              <span
                className={`forgot-password-link ${loadingLogin || transitioningToCode ? "opa-disabled" : ""}`}
                onClick={() => setStep("forgot-password")} // Cambiar estado al hacer clic
              >
                ¿Olvidaste la contraseña?
              </span>
            </div>


            {/* Enlace para registrarse */}
            <div className="auth-footer">
              ¿Es la primera vez que usas NutriScanU?
              <span
                className={`register-link ${loadingLogin || transitioningToCode ? "disabled" : ""}`}
                onClick={() => {
                  if (!loadingLogin && !transitioningToCode) {
                    navigate("/register");
                  }
                }}
              >
                Regístrate
              </span>
            </div>
          </form>
        )}

        {/* Formulario de restablecimiento de contraseña */}
        {step === "forgot-password" && (
          <form onSubmit={handleForgotPassword} className="forgot-password-form">
            <h2>Restablecer tu contraseña</h2>
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="text"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                if (errors.general) setErrors(prev => ({ ...prev, general: "" }));
              }}
              disabled={loadingLogin || buttonLoading.blockInputs}
              className={`input ${errors.email ? "input-error" : ""} ${buttonLoading.blockInputs ? "opa-disabled" : ""}`}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
            {errors.general && <div className="error-message">{errors.general}</div>}

            <button
              type="submit"
              disabled={loadingLogin || buttonLoading.blockInputs}
              className={`login-button ${buttonLoading.blockInputs ? "opa-disabled" : ""}`}
            >
              {loadingLogin ? <div className="loader-spinner" /> : "Enviar instrucciones"}
            </button>
            <div
              className={`login-code-button ${loadingLogin || buttonLoading.blockInputs ? "opa-disabled" : ""}`}
              onClick={() => {
                if (!buttonLoading.backToPassword && !loadingLogin && !buttonLoading.blockInputs) {
                  // 🔒 Bloquear inputs temporalmente
                  setButtonLoading((prev) => ({
                    ...prev,
                    backToPassword: true,
                    blockInputs: true,
                  }));

                  // ⏳ Simular transición
                  setTimeout(() => {
                    resetForm();                         // 🧼 Limpia campos
                    setStep("default");                  // 🔁 Volver a login
                    setErrors({ email: "", password: "", general: "", code: "" }); // ❌ Limpia errores

                    setButtonLoading((prev) => ({
                      ...prev,
                      backToPassword: false,
                      blockInputs: false,
                    }));
                  }, 800);
                }
              }}
            >
              {buttonLoading.backToPassword ? (
                <div className="loader-spinner small" />
              ) : (
                "Usar contraseña"
              )}
            </div>

          </form>
        )}

        {/* Mensaje de éxito después de enviar el correo */}
        {step === "success" && (
          <div className="default">
            <h2>¡Listo!</h2>
            <p>
              Te acabamos de enviar un correo con las instrucciones a{" "}
              <strong>{formatEmail(email)}</strong>. Sigue las instrucciones para restablecer tu contraseña.
            </p>

            {/* Botón de retroceso */}
            <button
              className="back-button"
              onClick={() => {
                setStep("default"); // Volver al formulario inicial
                setEmail(""); // Limpiar el correo
                setPassword(""); // Limpiar la contraseña
              }}
            >
              ←
            </button>
          </div>
        )}


        {step === "send-code" && (
          <form onSubmit={handleSendCode} className="form-send-code">
            <h1>Iniciar sesión</h1>
            <label style={{ fontWeight: "bold" }}>Correo</label>

            <input
              type="text"
              placeholder="Ingrese su correo"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email || errors.general) {
                  setErrors(prev => ({ ...prev, email: "", general: "" }));
                }
              }}
              className={`input ${errors.email ? "input-error" : ""} ${buttonLoading.blockInputs ? "opa-disabled" : ""}`}
              disabled={loadingLogin || buttonLoading.blockInputs}
            />
            {errors.email && <div className="error-message">{errors.email}</div>} {
              /* Mostrar mensaje de error */
              errors.general && <div className="error-message general-error">{errors.general}</div>
            }
            <button
              type="submit"
              disabled={loadingLogin || buttonLoading.blockInputs}
              className={`login-button ${buttonLoading.blockInputs ? "opa-disabled" : ""}`}
            >
              {loadingLogin ? <div className="loader-spinner" /> : "Enviar código de inicio de sesión"}
            </button>

            <div className="center-or"><span>O</span></div>
            <div
              className={`login-code-button ${loadingLogin || buttonLoading.blockInputs ? "opa-disabled" : ""}`}
              onClick={() => {
                if (!buttonLoading.backToPassword && !loadingLogin && !buttonLoading.blockInputs) {
                  setButtonLoading((prev) => ({
                    ...prev,
                    backToPassword: true,
                    blockInputs: true
                  }));

                  setTimeout(() => {
                    resetForm();
                    setStep("default");

                    setButtonLoading((prev) => ({
                      ...prev,
                      backToPassword: false,
                      blockInputs: false
                    }));
                  }, 800);
                }
              }}
            >
              {buttonLoading.backToPassword ? (
                <div className="loader-spinner small" />
              ) : (
                "Usar contraseña"
              )}
            </div>
          </form>
        )}

        {step === "enter-code" && (
          <form onSubmit={handleSubmitCode} onPaste={handlePasteCode} className="form-enter-code">
            <h2 className="text-xl font-bold text-center">Ingresa el código<br />que te acabamos de enviar</h2>
            <p className="code-info-subtext">
              Enviamos un código a <strong>{email}</strong>. Válido por 10 minutos.
            </p>

            <div className="code-inputs">
              {code.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  ref={(el) => (inputRefs.current[i] = el)}
                  disabled={buttonLoading.blockInputs}
                />
              ))}
            </div>

            {errors.code && <div className="error-message">{errors.code}</div>}
            {errors.general && <div className="error-message general-error">{errors.general}</div>}

            <button
              type="submit"
              className="login-button"
              onClick={handleVerifyCode}
              disabled={
                buttonLoading.backToPassword ||
                buttonLoading.resendCode ||
                buttonLoading.blockInputs
              }
            >
              {loading ? <span className="loader-spinner" /> : "Iniciar sesión"}
            </button>


            <div className="center-or"><span>¿No recibiste un código?</span></div>

            <div
              className={`login-code-button ${buttonLoading.backToPassword || buttonLoading.resendCode || buttonLoading.blockInputs
                ? "disabled"
                : ""
                }`}
              onClick={() => {
                if (
                  !buttonLoading.backToPassword &&
                  !buttonLoading.resendCode &&
                  !buttonLoading.blockInputs
                ) {
                  setButtonLoading((prev) => ({
                    ...prev,
                    backToPassword: true,
                    blockInputs: true
                  }));
                  // No limpiar el error aquí, revertido al comportamiento anterior
                  setTimeout(() => {
                    resetForm();
                    setStep("default");
                    setButtonLoading((prev) => ({
                      ...prev,
                      backToPassword: false,
                      blockInputs: false
                    }));
                  }, 800);
                }
              }}
            >
              {buttonLoading.backToPassword ? (
                <div className="loader-spinner small" />
              ) : (
                "Usar contraseña"
              )}
            </div>


            {resendAttempts < 2 && (
              <div
                className={`login-code-button secondary ${buttonLoading.resendCode || buttonLoading.backToPassword || buttonLoading.blockInputs
                  ? "disabled"
                  : ""
                  }`}
                onClick={() => {
                  if (
                    !buttonLoading.resendCode &&
                    !buttonLoading.backToPassword &&
                    !buttonLoading.blockInputs
                  ) {
                    setButtonLoading((prev) => ({
                      ...prev,
                      resendCode: true,
                      blockInputs: true
                    }));
                    // No limpiar el error aquí, revertido al comportamiento anterior
                    setResendAttempts((prev) => prev + 1);
                    setCode(["", "", "", "", ""]); // Limpia inputs
                    handleSendCode({ preventDefault: () => { } });
                    setTimeout(() => {
                      setButtonLoading((prev) => ({
                        ...prev,
                        resendCode: false,
                        blockInputs: false
                      }));
                    }, 1500);
                  }
                }}
              >
                {buttonLoading.resendCode ? (
                  <div className="loader-spinner small" />
                ) : (
                  "Reenviar código"
                )}
              </div>


            )}

          </form>
        )}

      </div>
    </div>
  );
}

export default Login;
