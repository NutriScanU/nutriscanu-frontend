import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BloodAnalysisForm from "../pages/BloodAnalysisForm";
import RecommendationForm from "../pages/RecommendationForm";
import "../../../styles/MultiStepForm.css"; // Estilos exclusivos

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [clinicData, setClinicData] = useState(null);
  const [habitsData, setHabitsData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [setMensajeIncompleto] = useState("");
  
  // 🔥 NUEVOS ESTADOS PARA DISEÑO MEJORADO
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorStartTime, setErrorStartTime] = useState(null);
  const [successStartTime, setSuccessStartTime] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // 🔁 Limpiar algunos estados al montar el componente
    setHabitsData(null);
    setShowSuccess(false);
    setShowError(false);
    setIsProcessing(false);
    localStorage.removeItem("recommendationFormData");
  }, []);

  // ⏱️ EFECTO PARA TIMER EN TIEMPO REAL
  useEffect(() => {
    let interval;
    if (isProcessing && processingStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - processingStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else if (showError && errorStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - errorStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else if (showSuccess && successStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - successStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, processingStartTime, showError, errorStartTime, showSuccess, successStartTime]);

  // 🚀 FUNCIÓN HELPER PARA TIMEOUT
  const fetchWithTimeout = async (url, options, timeoutMs = 30000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado. El servidor no responde.');
      }
      throw error;
    }
  };


  const handleGoBack = () => {
    navigate("/student/home");
  };

  const handleClinicSubmit = (data) => {
    setClinicData(data);
    setStep(2);
  };

  const handleHabitsSubmit = (data) => {
    setHabitsData(data);
    setShowConfirmModal(true);
  };

  const handleFinish = async () => {
    try {
      // 🚀 INICIAR PROCESAMIENTO
      setIsProcessing(true);
      setProcessingStartTime(Date.now());
      setElapsedTime(0);
      setShowError(false);
      setShowSuccess(false);

      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      if (!habitsData) {
        setMensajeIncompleto("⚠️ Completa los datos de hábitos antes de finalizar.");
        return;
      }

      let predictedCondition;

      // 🆕 FLUJO COMPLETO CON DATOS CLÍNICOS
      if (!clinicData) {
        setMensajeIncompleto("⚠️ Completa todos los datos antes de finalizar.");
        return;
      }

      const requiredFields = [
        "age", "gender", "smoking_history", "bmi", "hbA1c",
        "blood_glucose_level", "hemoglobin", "insulin",
        "triglycerides", "hematocrit", "red_blood_cells"
      ];

      for (const field of requiredFields) {
        if (!clinicData[field]) {
          throw new Error(`Falta completar: ${field}`);
        }
      }

      const numericData = {
        ...clinicData,
        age: Number(clinicData.age),
        bmi: Number(clinicData.bmi),
        hbA1c: Number(clinicData.hbA1c),
        blood_glucose_level: Number(clinicData.blood_glucose_level),
        hemoglobin: Number(clinicData.hemoglobin),
        insulin: Number(clinicData.insulin),
        triglycerides: Number(clinicData.triglycerides),
        hematocrit: Number(clinicData.hematocrit),
        red_blood_cells: Number(clinicData.red_blood_cells),
      };

      // 🧠 PREDICCIÓN ML (Timeout 30s para ML)
      const predictResponse = await fetchWithTimeout(
        `${process.env.REACT_APP_BACKEND_FLASK_URL}/predict`, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(numericData),
        },
        30000
      );

      if (!predictResponse.ok) {
        throw new Error(`Error en predicción: ${predictResponse.status}`);
      }

      const predictResult = await predictResponse.json();
      predictedCondition = predictResult.condition;

      // 💾 GUARDAR DATOS CLÍNICOS
      const clinicResponse = await fetchWithTimeout(
        `${process.env.REACT_APP_API_URL}/api/students/register-clinic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...numericData,
            gender: clinicData.gender,
            smoking_history: clinicData.smoking_history,
            condition: predictedCondition,
          }),
        },
        15000
      );

      if (!clinicResponse.ok) {
        throw new Error(`Error guardando datos clínicos: ${clinicResponse.status}`);
      }

      const inputForRecommend = [
        predictedCondition,
        habitsData.comidas_dia,
        habitsData.frutas_verduras,
        habitsData.alergias,
        habitsData.bebidas_azucaradas,
        habitsData.actividad,
        habitsData.objetivo,
        habitsData.ultraprocesados,
        habitsData.estres,
        habitsData.fatiga,
        habitsData.comer_fuera,
      ];

      // 🤖 RECOMENDACIONES ML (Timeout 30s para ML)
      const recommendResponse = await fetchWithTimeout(
        `${process.env.REACT_APP_BACKEND_FLASK_URL}/recommend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ input: inputForRecommend }),
        },
        30000
      );

      if (!recommendResponse.ok) {
        throw new Error(`Error en recomendaciones: ${recommendResponse.status}`);
      }

      const recommendResult = await recommendResponse.json();
      const recommendations = recommendResult.recommendations || [];

      // 💾 GUARDAR RECOMENDACIONES (Timeout 15s para CRUD)
      const saveResponse = await fetchWithTimeout(
        `${process.env.REACT_APP_API_URL}/api/students/analyze-recommendation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            condition: predictedCondition,
            recommendations,
            habits: {
              comidas_dia: habitsData.comidas_dia,
              frutas_verduras: habitsData.frutas_verduras,
              alergias: habitsData.alergias,
              bebidas_azucaradas: habitsData.bebidas_azucaradas,
              actividad_fisica: habitsData.actividad,
              objetivo_alimentacion: habitsData.objetivo,
              ultraprocesados: habitsData.ultraprocesados,
              estres: habitsData.estres,
              energia_fatiga: habitsData.fatiga,
              comidas_fuera: habitsData.comer_fuera,
            },
          }),
        },
        15000
      );

      if (!saveResponse.ok) {
        throw new Error(`Error guardando recomendaciones: ${saveResponse.status}`);
      }

      // ✅ ÉXITO
      setIsProcessing(false);
      setShowSuccess(true);
      setSuccessStartTime(Date.now());
      setElapsedTime(0);
      
      // 🚀 REDIRECCIÓN DESPUÉS DE 5 SEGUNDOS
      setTimeout(() => {
        setIsRedirecting(true);
        setTimeout(() => {
          navigate("/student/home", { replace: true });
        }, 1000);
      }, 5000);

    } catch (error) {
      console.error("Error:", error);
      
      // ❌ ERROR
      setIsProcessing(false);
      setShowError(true);
      setErrorStartTime(Date.now());
      setElapsedTime(0);
      
      // Determinar tipo de error
      if (error.message.includes("Tiempo de espera")) {
        setErrorMessage("¡Ups! El sistema se cayó");
      } else if (error.message.includes("Failed to fetch")) {
        setErrorMessage("¡Ups! El sistema se cayó");
      } else if (error.message.includes("predicción")) {
        setErrorMessage("Error en el análisis de datos");
      } else if (error.message.includes("recomendaciones")) {
        setErrorMessage("Error generando recomendaciones");
      } else {
        setErrorMessage("¡Ups! El sistema se cayó");
      }

      // 🚀 REDIRECCIÓN DESPUÉS DE 5 SEGUNDOS EN ERROR
      setTimeout(() => {
        setIsRedirecting(true);
        setTimeout(() => {
          navigate("/student/home", { replace: true });
        }, 1000);
      }, 5000);
    }
  };

  return (
    <div className="multi-step-form">
      {/* ← Botón superior izquierdo - Solo en pasos 1 y 2 */}
      {step < 3 && !isProcessing && !showSuccess && !showError && (
        <button 
          className={`back-button ${showConfirmModal ? 'disabled' : ''}`} 
          onClick={handleGoBack}
          disabled={showConfirmModal}
        >
          ←
        </button>
      )}

      {/* Progreso */}
      <div className="multi-step-progress">
        {[1, 2, 3].map((n) => (
          <div 
            key={n} 
            className={`multi-step-item ${step >= n ? "active" : ""} ${step === n ? "current" : ""}`}
          >
            <div className="multi-step-circle">
              {n}
            </div>
            <p className="multi-step-label">
              {n === 1 ? "Datos clínicos" : n === 2 ? "Hábitos" : "Confirmar"}
            </p>
          </div>
        ))}
      </div>

      {/* Contenido */}
      <div className="multi-step-content">
        {/* PASO 1: Datos Clínicos */}
        {step === 1 && !isProcessing && !showSuccess && !showError && (
          <BloodAnalysisForm onSubmit={handleClinicSubmit} initialData={clinicData} />
        )}
        
        {/* PASO 2: Hábitos */}
        {step === 2 && !isProcessing && !showSuccess && !showError && (
          <RecommendationForm onSubmit={handleHabitsSubmit} initialData={habitsData} />
        )}
        
        {/* PASO 3: Confirmación */}
        {step === 3 && !isProcessing && !showSuccess && !showError && (
          <div className="multi-step-confirmation">
            <h2>🎉 ¡Formulario completado!</h2>
            <p>Gracias por registrar tus datos.</p>
          </div>
        )}

        {/* 🔄 ESTADO DE PROCESAMIENTO */}
        {isProcessing && (
          <div className="processing-section">
            <div className="processing-content">
              <div className="processing-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <h3 className="processing-title">Procesando tu información...</h3>
              <p className="processing-subtitle">Analizando datos clínicos y generando recomendaciones personalizadas</p>
            </div>
          </div>
        )}

        {/* ✅ ESTADO DE ÉXITO */}
        {showSuccess && (
          <div className="success-section">
            <div className="success-content">
              <div className="success-icon">🎉</div>
              <h2 className="success-title">¡Formulario completado!</h2>
              <p className="success-subtitle">Gracias por registrar tus datos.</p>
              
              {!isRedirecting && (
                <div className="success-timer timer-circle">
                  <svg className="timer-svg" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <circle 
                      className="timer-bg" 
                      cx="50" 
                      cy="50" 
                      r="45" 
                    />
                    <circle 
                      className="timer-progress" 
                      cx="50" 
                      cy="50" 
                      r="45"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * Math.max(0, (5 - elapsedTime) / 5)}`}
                    />
                  </svg>
                  <div className="timer-text">
                    <div className="timer-number">{Math.max(0, 5 - elapsedTime)}</div>
                    <div className="timer-label">SEG</div>
                  </div>
                </div>
              )}
              
              <p className="success-redirect">
                {isRedirecting ? "Regresando al panel de control..." : "Regresando al panel de control..."}
              </p>
            </div>
          </div>
        )}

        {/* ❌ ESTADO DE ERROR */}
        {showError && (
          <div className="error-section">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="error-title">{errorMessage}</h2>
            <p className="error-subtitle">Tenemos problemas técnicos. Vuelve a intentar más tarde.</p>
            
            {!isRedirecting && (
              <div className="error-timer timer-circle">
                <svg className="timer-svg" viewBox="0 0 100 100">
                  <circle 
                    className="timer-bg" 
                    cx="50" 
                    cy="50" 
                    r="45" 
                  />
                  <circle 
                    className="timer-progress" 
                    cx="50" 
                    cy="50" 
                    r="45"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * Math.max(0, (5 - elapsedTime) / 5)}`}
                  />
                </svg>
                <div className="timer-text">
                  <div className="timer-number">{Math.max(0, 5 - elapsedTime)}</div>
                  <div className="timer-label">SEG</div>
                </div>
              </div>
            )}
            
            <p className="error-redirect">
              {isRedirecting ? "Regresando al panel de control..." : "Regresando al panel de control..."}
            </p>
          </div>
        )}

        {/* Botones navegación - Solo mostrar si no estamos procesando o mostrando resultados */}
        {step < 3 && !isProcessing && !showSuccess && !showError && (
          <div className="multi-step-navigation">
            {step > 1 && (
              <button className="multi-step-button" onClick={() => setStep(step - 1)}>
                ← Anterior
              </button>
            )}
            <button
              className="multi-step-button"
              onClick={() => {
                const form = document.querySelector("form");
                if (form) form.requestSubmit();
              }}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Modal confirmación */}
      {showConfirmModal && !isProcessing && !showSuccess && !showError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>¿Estás seguro de enviar tus datos?</p>
            <div className="confirm-actions">
              <button
                className="multi-step-button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setStep(3);
                  handleFinish();
                }}
              >
                Sí, continuar
              </button>
              <button
                className="multi-step-button cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                No, revisar otra vez
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;
