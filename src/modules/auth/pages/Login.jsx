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

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingToCode, setLoadingToCode] = useState(false);
  
  const [resendAttempts, setResendAttempts] = useState(0);

  const [buttonLoading, setButtonLoading] = useState({
    backToPassword: false,
    resendCode: false,
    blockInputs: false
  });
  const inputRefs = useRef([]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setCode(["", "", "", "", ""]);
    setErrors({ email: "", password: "", general: "", code: "" });
    setShowCheck(false);
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
        setErrors((prev) => ({ ...prev, general: "Usuario y/o contraseña incorrectos." }));
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

    try {
      setLoadingLogin(true);

      const res = await fetch(`${API_URL}/api/auth/send-login-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setErrors({ ...errors, general: "Error al enviar el código", code: "" });
        return;
      }

      setStep("enter-code");
      setErrors({ email: "", password: "", general: "", code: "" });
    } catch (err) {
      alert("Error al enviar el código");
    } finally {
      setLoadingLogin(false);

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
        body: JSON.stringify({ email, code: finalCode }),
      });

      if (!res.ok) {
        return setErrors({ code: "", general: "Código incorrecto o expirado" });
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

  const handleResendCodeClick = () => {
    if (!buttonLoading.resendCode && !buttonLoading.backToPassword && resendAttempts < 2) {
      const updated = resendAttempts + 1;
      setResendAttempts(updated);
      sessionStorage.setItem("resendAttempts", updated);
  
      setButtonLoading((prev) => ({
        ...prev,
        resendCode: true,
        blockInputs: true
      }));
  
      handleSendCode({ preventDefault: () => {} });
  
      setTimeout(() => {
        setButtonLoading((prev) => ({
          ...prev,
          resendCode: false,
          blockInputs: false
        }));
      }, 1000);
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
      <div className="auth-background" />
      <div className="auth-overlay" />
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate("/")}>NutriScanU</div>

        {step === "default" && (
          <>
            <h1>Bienvenido de vuelta</h1>
            <p>Qué bueno verte otra vez :)</p>
            <form onSubmit={handleLogin}>
              <label htmlFor="email">Correo</label>
              <div className="input-with-icon">
                <input
                  id="email"
                  type="text"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email || errors.general) {
                      setErrors((prev) => ({ ...prev, email: "", general: "" }));
                    }
                  }}
                  className={errors.email ? "input-error" : ""}
                  disabled={loadingLogin || transitioningToCode}/>
                {showCheck && <span className="checkmark">✔</span>}
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}

              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password || errors.general) {
                    setErrors((prev) => ({ ...prev, password: "", general: "" }));
                  }
                }}
                className={errors.password ? "input-error" : ""}
                disabled={loadingLogin || transitioningToCode}/>
              {errors.password && <div className="error-message">{errors.password}</div>}
              {errors.general && <div className="error-message general-error">{errors.general}</div>}

              <button
  type="submit"
  disabled={loadingLogin || transitioningToCode}
  className="login-button"
>
  {loadingLogin ? <div className="loader-spinner" /> : "Iniciar sesión"}
</button>




              <div className="center-or"><span>O</span></div>
              <div
  className={`login-code-button ${loadingLogin || transitioningToCode ? "disabled" : ""}`}
  onClick={() => {
    if (!loadingLogin && !transitioningToCode) {
      setTransitioningToCode(true);
      setTimeout(() => {
        resetForm();
        setStep("send-code");
        setTransitioningToCode(false);
      }, 800);
    }
  }}
>
  {transitioningToCode ? <div className="loader-spinner small" /> : "Usar un código de inicio de sesión"}
</div>





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
          </>
        )}

{step === "send-code" && (
  <form onSubmit={handleSendCode} className="form-send-code">
    <h1>Iniciar sesión</h1>
    <label style={{ fontWeight: "bold" }}>Email o número de celular</label>
    
    <input
      type="text"
      placeholder="Email o número de celular"
      value={email}
      onChange={(e) => {
        setEmail(e.target.value);
        if (errors.email || errors.general) {
          setErrors(prev => ({ ...prev, email: "", general: "" }));
        }
      }}
      className={errors.email ? "input-error" : ""}
      disabled={loadingLogin}
    />
    
    {errors.email && <div className="error-message">{errors.email}</div>}
    {errors.general && <div className="error-message general-error">{errors.general}</div>}

    <button
      type="submit"
      disabled={loadingLogin}
      className="login-button"
    >
      {loadingLogin ? <div className="loader-spinner" /> : "Enviar código de inicio de sesión"}
    </button>

    <div className="center-or"><span>O</span></div>

    <div
      className={`login-code-button ${loadingLogin ? "disabled" : ""}`}
      onClick={() => {
        if (!loadingLogin) {
          setButtonLoading((prev) => ({ ...prev, backToPassword: true }));
          setTimeout(() => {
            resetForm();
            setStep("default");
            setButtonLoading((prev) => ({ ...prev, backToPassword: false }));
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
      disabled={
        buttonLoading.backToPassword ||
        buttonLoading.resendCode ||  // ✅ aquí añadimos esta condición
        buttonLoading.blockInputs
      }
    >
      Iniciar sesión
    </button>

    <div className="center-or"><span>¿No recibiste un código?</span></div>

    <div
  className={`login-code-button ${
    buttonLoading.backToPassword || buttonLoading.resendCode || buttonLoading.blockInputs
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
  className={`login-code-button secondary ${
    buttonLoading.resendCode || buttonLoading.backToPassword || buttonLoading.blockInputs
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
      handleSendCode({ preventDefault: () => {} });
      setTimeout(() => {
        setButtonLoading((prev) => ({
          ...prev,
          resendCode: false,
          blockInputs: false
        }));
      }, 1000);
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
