// src/modules/student/pages/Recommendations.jsx

import React, { useState } from "react";
import { API_URL, BACKEND_FLASK_URL } from "../../../config";  // ✅ Usar API_URL y BACKEND_FLASK_URL
import RecommendationForm from "./RecommendationForm";

const Recommendations = () => {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Condición desde localStorage (debe haberse guardado en AnalysisStatus.jsx)
  const condicion = localStorage.getItem("condicion_predicha");

  const handleSubmit = async (respuestasHabitos) => {
    try {
      const token = localStorage.getItem("token");

      // Paso 1: Pedir recomendaciones al backend Flask
      const input = [condicion, ...respuestasHabitos];
      const response = await fetch(`${BACKEND_FLASK_URL}/recommend`, {  // ✅ Usar BACKEND_FLASK_URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();
      console.log("📥 Recomendaciones del modelo:", data);

      if (!response.ok) {
        setMensaje("❌ Error al generar recomendaciones.");
        return;
      }

      const recomendacionesGeneradas = data.recommendations || [];
      setRecomendaciones(recomendacionesGeneradas);
      setMensaje("✅ Recomendación generada correctamente.");

      // Paso 2: Enviar recomendaciones al backend FastAPI para guardar en BD
      const saveResponse = await fetch(`${API_URL}/api/students/analyze-recommendation`, {  // ✅ Usar API_URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          condition: condicion,
          recommendations: recomendacionesGeneradas,
          habits: {
            comidas_dia: respuestasHabitos[0],
            frutas_verduras: respuestasHabitos[1],
            alergias: respuestasHabitos[2],
            bebidas_azucaradas: respuestasHabitos[3],
            actividad_fisica: respuestasHabitos[4],
            objetivo_alimentacion: respuestasHabitos[5],
            ultraprocesados: respuestasHabitos[6],
            estres: respuestasHabitos[7],
            energia_fatiga: respuestasHabitos[8],
            comidas_fuera: respuestasHabitos[9],
          },
        }),
      });

      const saveResult = await saveResponse.json();
      console.log("📦 Respuesta al guardar en BD:", saveResult);

      if (!saveResponse.ok) {
        alert("❌ Error al guardar en base de datos: " + (saveResult.detail || ""));
      }

    } catch (error) {
      console.error("❌ Error general:", error);
      setMensaje("❌ Error de conexión.");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", paddingTop: "2rem" }}>
      <h2>Recomendaciones Alimenticias Personalizadas</h2>

      <RecommendationForm onSubmit={handleSubmit} />

      {mensaje && (
        <p style={{ marginTop: "1rem", color: mensaje.includes("✅") ? "green" : "red" }}>
          {mensaje}
        </p>
      )}

      {recomendaciones.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3>🍎 Tus recomendaciones son:</h3>
          <ul>
            {recomendaciones.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
