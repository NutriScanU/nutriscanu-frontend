import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
          setErrors({ ...errors, general: "Hubo un error al enviar el email. Intenta nuevamente." });
        }
      } else {
        setErrors(prev => ({
          ...prev,
          email: "El correo ingresado no está registrado. Por favor, ingresa un correo electrónico válido o regístrate.",
          general: ""
        }));
      }

    } catch (err) {
      setErrors({ ...errors, general: "Error al verificar el correo. Intenta nuevamente." });
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
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: "" }));
    }
  }, [code, errors.code]);


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

    if (code.some((digit) => digit.trim() === "")) {
      return setErrors((prev) => ({ ...prev, code: "Código incompleto" }));
    }

    const fullCode = code.join("");
    if (!/^\d{5}$/.test(fullCode)) {
      return setErrors((prev) => ({ ...prev, code: "Código incorrecto" }));
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

      setTimeout(() => {
        if (response.ok) {
          const decoded = jwtDecode(data.token);
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", decoded.userId);

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
        setErrors(prev => ({ ...prev, code: "Error en la red. Intenta de nuevo." }));
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

      if (decoded.role === "student") {
        navigate("/student/home");
      } else {
        alert("Tu cuenta no tiene permiso para acceder al perfil de estudiante.");
      }
    } catch (err) {
      alert("Login fallido. Verifica tus datos o conexión.");
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
      setErrors(prev => ({
        ...prev,
        general: "Servidor caido. Intenta más tarde.",
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
      alert("Error de red.");
    }
  };

  const handleCodeChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
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
            <input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Limpiar los errores cuando el usuario empieza a escribir
                if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                if (errors.general) setErrors(prev => ({ ...prev, general: "" }));
              }}
              className={errors.password ? "input-error" : ""}
              disabled={loadingLogin || transitioningToCode}
            />
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
              onChange={(e) => setEmail(e.target.value)}
              disabled={loadingLogin || buttonLoading.blockInputs}
              className={`input ${errors.email ? "input-error" : ""} ${buttonLoading.blockInputs ? "opa-disabled" : ""}`}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}

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
              Enviamos un código a <strong>{email}</strong>. Válido por 15 minutos.
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
