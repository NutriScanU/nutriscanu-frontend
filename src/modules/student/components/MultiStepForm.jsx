import React, { useState } from "react";
import { useEffect } from "react"; // 👈 Asegúrate de importar esto arriba

import { useNavigate } from "react-router-dom";
import BloodAnalysisForm from "../pages/BloodAnalysisForm";
import RecommendationForm from "../pages/RecommendationForm";
import "../../../styles/MultiStepForm.css"; // Estilos exclusivos

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [clinicData, setClinicData] = useState(null);
  const [habitsData, setHabitsData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mensajeIncompleto, setMensajeIncompleto] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 🔁 Reiniciar flujo completamente al montar el componente
    setClinicData(null);
    setHabitsData(null);
    setStep(1);
    localStorage.removeItem("recommendationFormData"); // 🧹 Limpiar almacenamiento local
  }, []);


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
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      if (!clinicData || !habitsData) {
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
          alert(`Falta completar: ${field}`);
          return;
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

      const predictResponse = await fetch(`${process.env.REACT_APP_BACKEND_FLASK_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(numericData),
      });

      const predictResult = await predictResponse.json();
      const predictedCondition = predictResult.condition;

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

      navigate("/student/home", { replace: true });
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al guardar tus datos.");
    }
  };

  return (
    <div className="multi-step-form">
      {/* ← Botón superior izquierdo */}
      <button className="back-button" onClick={handleGoBack}>
        ←
      </button>

      {/* Progreso */}
      <div className="multi-step-progress">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`multi-step-item ${step >= n ? "active" : ""}`}>
            <div className="multi-step-circle">{n}</div>
            <p className="multi-step-label">
              {n === 1 ? "Datos clínicos" : n === 2 ? "Hábitos" : "Confirmar"}
            </p>
          </div>
        ))}
      </div>

      {/* Contenido */}
      <div className="multi-step-content">
        {step === 1 && (
          <BloodAnalysisForm onSubmit={handleClinicSubmit} initialData={clinicData} />
        )}
        {step === 2 && (
          <RecommendationForm onSubmit={handleHabitsSubmit} initialData={habitsData} />
        )}
        {step === 3 && (
          <div className="multi-step-confirmation">
            <h2>🎉 ¡Formulario completado!</h2>
            <p>Gracias por registrar tus datos.</p>
          </div>
        )}

        {/* Botones navegación */}
        {step < 3 && (
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
      {showConfirmModal && (
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
