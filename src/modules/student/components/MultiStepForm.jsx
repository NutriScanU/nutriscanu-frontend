import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BloodAnalysisForm from "../pages/BloodAnalysisForm";
import RecommendationForm from "../pages/RecommendationForm";
import "../../../styles/MultiStepForm.css";

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [clinicData, setClinicData] = useState(null);
  const [habitsData, setHabitsData] = useState(null);
  const [mensajeIncompleto, setMensajeIncompleto] = useState("");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const navigate = useNavigate();

  const flaskUrl = process.env.REACT_APP_BACKEND_FLASK_URL;
  const fastapiUrl = process.env.REACT_APP_API_URL;

  const handleClinicSubmit = (data) => {
    setClinicData(data);
    nextStep();
  };

  const handleHabitsSubmit = (data) => {
    setHabitsData(data);
    setMostrarConfirmacion(true);
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleFinish = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Debes iniciar sesión.");
        navigate("/login");
        return;
      }
  
      if (!clinicData || !habitsData) {
        setMensajeIncompleto("⚠️ Completa todos los datos antes de finalizar.");
        return;
      }
  
      // ✅ Validaciones antes de enviar
      const requiredFields = [
        "age", "gender", "smoking_history", "bmi", "hbA1c", "blood_glucose_level",
        "hemoglobin", "insulin", "triglycerides", "hematocrit", "red_blood_cells"
      ];
  
      for (const field of requiredFields) {
        if (clinicData[field] === undefined || clinicData[field] === "" || clinicData[field] === null) {
          alert(`❗ El campo "${field}" es obligatorio y falta completarlo.`);
          return;
        }
      }
  
      const genderValid = ["Male", "Female"].includes(clinicData.gender);
      const smokingValid = ["Never", "Former", "Current", "Ever", "Not Current", "No Info"].includes(clinicData.smoking_history);
  
      if (!genderValid) {
        alert("❗ Género inválido. Debe ser 'Male' o 'Female'.");
        return;
      }
  
      if (!smokingValid) {
        alert("❗ Historial de tabaquismo inválido. Debe ser: Never, Former, Current, Ever, Not Current o No Info.");
        return;
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
  
      // 🛠 Verificar que los numéricos no sean NaN
      for (const key of Object.keys(numericData)) {
        if (typeof numericData[key] === "number" && isNaN(numericData[key])) {
          alert(`❗ El campo "${key}" debe ser un número válido.`);
          return;
        }
      }
  
      // 🚀 PREDICT desde Flask
      const predictResponse = await fetch(`${process.env.REACT_APP_BACKEND_FLASK_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(numericData),
      });
  
      const predictResult = await predictResponse.json();
      if (!predictResponse.ok) {
        alert(predictResult.error || "Error en predicción");
        return;
      }
  
      const predictedCondition = predictResult.condition;
  
      // 🚀 GUARDAR análisis clínico en FastAPI
      await fetch(`${process.env.REACT_APP_API_URL}/api/students/register-clinic`, {
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
      });
  
      // 🚀 RECOMENDAR hábitos
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
  
      const recommendResponse = await fetch(`${process.env.REACT_APP_BACKEND_FLASK_URL}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ input: inputForRecommend }),
      });
  
      const recommendResult = await recommendResponse.json();
      const recommendations = recommendResult.recommendations || [];
  
      // 🚀 GUARDAR recomendaciones
      await fetch(`${process.env.REACT_APP_API_URL}/api/students/analyze-recommendation`, {
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
      });
  
      alert("✅ Análisis y recomendaciones guardadas exitosamente.");
      navigate("/student/home", { replace: true });
  
    } catch (error) {
      console.error("❌ Error general:", error);
      alert("Error de red o backend desconectado.");
    }
  };
  

  return (
    <div className="multi-step-form">
      <div className="multi-step-progress">
        <div className={`multi-step-item ${step >= 1 ? "active" : ""}`}>
          <div className="multi-step-circle">1</div>
          <p className="multi-step-label">Datos clínicos</p>
        </div>
        <div className={`multi-step-item ${step >= 2 ? "active" : ""}`}>
          <div className="multi-step-circle">2</div>
          <p className="multi-step-label">Hábitos</p>
        </div>
        <div className={`multi-step-item ${step === 3 ? "active" : ""}`}>
          <div className="multi-step-circle">3</div>
          <p className="multi-step-label">Confirmar</p>
        </div>
      </div>

      <div className="multi-step-content">
        {step === 1 && (
          <BloodAnalysisForm
            key="step1"
            onSubmit={handleClinicSubmit}
            initialData={clinicData}
          />
        )}

        {step === 2 && (
          <div>
            <RecommendationForm
              key="step2"
              onSubmit={handleHabitsSubmit}
              initialData={habitsData}
            />

            {mostrarConfirmacion && (
              <div className="confirm-box">
                <p>¿Estás seguro de enviar tus datos?</p>
                <div className="confirm-actions">
                  <button
                    className="multi-step-button"
                    onClick={() => {
                      setStep(3);
                      setMostrarConfirmacion(false);
                    }}
                  >
                    Sí, continuar
                  </button>
                  <button
                    className="multi-step-button cancel"
                    onClick={() => setMostrarConfirmacion(false)}
                  >
                    No, revisar otra vez
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="multi-step-confirmation">
            <h2>🎉 ¡Formulario completado!</h2>
            <p>Gracias por registrar tus datos.</p>

            <button
              className="multi-step-button"
              disabled={!clinicData || !habitsData}
              onClick={(e) => {
                e.preventDefault();
                if (!clinicData || !habitsData) {
                  setMensajeIncompleto("⚠️ Completa todos los datos antes de finalizar.");
                } else {
                  handleFinish();
                }
              }}
            >
              Finalizar
            </button>

            {mensajeIncompleto && (
              <p style={{ color: "red", marginTop: "1rem" }}>{mensajeIncompleto}</p>
            )}
          </div>
        )}

        {step < 3 && (
          <div className="multi-step-navigation">
            {step > 1 && (
              <button className="multi-step-button" onClick={prevStep}>
                ← Anterior
              </button>
            )}
            {step < 3 && (
              <button
                className="multi-step-button"
                onClick={() => {
                  const form = document.querySelector("form");
                  if (form) {
                    form.requestSubmit();
                  }
                }}
              >
                Siguiente →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
