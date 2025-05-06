import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BloodAnalysisForm from "./BloodAnalysisForm";

const API_FLASK_URL = process.env.REACT_APP_BACKEND_FLASK_URL;
const API_NODE_URL = process.env.REACT_APP_API_URL;

const AnalysisStatus = () => {
  const [condition, setCondition] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión primero.");
      navigate("/login");
    }
  }, [navigate]);

  const handlePredictionSubmit = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Tu sesión ha expirado. Vuelve a iniciar sesión.");
        navigate("/login");
        return;
      }

      const numericData = {
        ...formData,
        age: Number(formData.age),
        bmi: Number(formData.bmi),
        hbA1c: Number(formData.hbA1c),
        blood_glucose_level: Number(formData.blood_glucose_level),
        hemoglobin: Number(formData.hemoglobin),
        insulin: Number(formData.insulin),
        triglycerides: Number(formData.triglycerides),
        hematocrit: Number(formData.hematocrit),
        red_blood_cells: Number(formData.red_blood_cells),
      };

      // 🔍 Paso 1: Predicción con Flask
      const response = await fetch(`${API_FLASK_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(numericData)
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Error en la predicción.");
        return;
      }

      setCondition(result.condition);
      localStorage.setItem("condicion_predicha", result.condition);

      // 🧾 Paso 2: Guardar análisis en base de datos
      const registroResponse = await fetch(`${API_NODE_URL}/api/students/register-clinic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...numericData,
          gender: formData.gender,
          smoking_history: formData.smoking_history,
          condition: result.condition
        }),
      });

      const registroResult = await registroResponse.json();
      if (registroResponse.ok) {
        setMensaje("✅ Análisis registrado correctamente.");
      } else {
        setMensaje(registroResult.error || "❌ No se pudo guardar en la base de datos.");
        console.error("🛑 Error en guardado:", registroResult);
      }

    } catch (err) {
      console.error("❌ Error general:", err);
      alert("Error de red o servidor no disponible.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", paddingTop: "2rem" }}>
      <h2>Registro de Análisis de Sangre</h2>
      {!condition ? (
        <BloodAnalysisForm onSubmit={handlePredictionSubmit} />
      ) : (
        <h3>🩺 Condición predicha por el modelo: <strong>{condition}</strong></h3>
      )}
      {mensaje && (
        <p style={{ marginTop: "1rem", color: mensaje.includes("✅") ? "green" : "red" }}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default AnalysisStatus;
