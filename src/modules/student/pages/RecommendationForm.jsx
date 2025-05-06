import React, { useState, useEffect } from "react";
import "../../../styles/RecommendationForm.css";

const RecommendationForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    comidas_dia: "",
    frutas_verduras: "",
    alergias: "",
    bebidas_azucaradas: "",
    actividad: "",
    objetivo: "",
    ultraprocesados: "",
    estres: "",
    fatiga: "",
    comer_fuera: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // ✅ Enviamos objeto completo
  };

  const preguntas = [
    { label: "¿Cuántas comidas realizas al día?", name: "comidas_dia", options: ["2", "3", "4", "5"] },
    { label: "¿Cuántas veces a la semana consumes frutas y verduras?", name: "frutas_verduras", options: ["0-1", "2-3", "4-5", "6-7"] },
    { label: "¿Tienes alguna alergia o intolerancia alimentaria?", name: "alergias", options: [
        "Soy vegetariano/a",
        "Soy vegano/a",
        "Intolerancia a la lactosa",
        "Alergia al pescado o mariscos",
        "Alergia a frutos secos",
        "Alergia al gluten",
        "Ninguna"
      ]
    },
    { label: "¿Consumes bebidas azucaradas frecuentemente?", name: "bebidas_azucaradas", options: ["Nunca", "1-2 veces por semana", "3-5 veces", "Diariamente"] },
    { label: "¿Qué tan activo eres físicamente durante la semana?", name: "actividad", options: ["Sedentario", "Moderado", "Activo"] },
    { label: "¿Cuál es tu objetivo principal con tu alimentación?", name: "objetivo", options: ["Mantener peso", "Bajar", "Subir", "Mejorar salud"] },
    { label: "¿Consumes alimentos ultraprocesados (fast food, snacks, embutidos)?", name: "ultraprocesados", options: ["Nunca", "1-2 veces por semana", "3+ veces"] },
    { label: "¿Cómo calificarías tu nivel de estrés diario?", name: "estres", options: ["Bajo", "Moderado", "Alto", "Muy alto"] },
    { label: "¿Sueles sentirte con poca energía o fatiga durante el día?", name: "fatiga", options: ["Sí", "No", "A veces"] },
    { label: "¿Con qué frecuencia comes fuera de casa por motivos de estudio o trabajo?", name: "comer_fuera", options: ["Casi nunca", "1-2 veces por semana", "3-5 veces por semana", "Todos los días"] },
  ];

  return (
    <form className="reco-form" onSubmit={handleSubmit}>
      <h3 className="reco-title">Formulario de Recomendación Nutricional</h3>

      {preguntas.map(({ label, name, options }) => (
        <label key={name} className="reco-label">
          {label}
          <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className="reco-select"
            required
          >
            <option value="">-- Selecciona --</option>
            {options.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        </label>
      ))}
    </form>
  );
};

export default RecommendationForm;
