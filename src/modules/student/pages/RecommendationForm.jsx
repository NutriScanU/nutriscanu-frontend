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
    onSubmit(formData); // ✅ Enviamos objeto completo, no array
  };

  const preguntas = [
    { label: "¿Cuántas comidas realizas al día?", name: "comidas_dia" },
    { label: "¿Cuántas veces a la semana consumes frutas y verduras?", name: "frutas_verduras" },
    { label: "¿Tienes alguna alergia o intolerancia alimentaria?", name: "alergias" },
    { label: "¿Consumes bebidas azucaradas frecuentemente?", name: "bebidas_azucaradas" },
    { label: "¿Qué tan activo eres físicamente durante la semana?", name: "actividad" },
    { label: "¿Cuál es tu objetivo principal con tu alimentación?", name: "objetivo" },
    { label: "¿Consumes alimentos ultraprocesados (fast food, snacks, embutidos)?", name: "ultraprocesados" },
    { label: "¿Cómo calificarías tu nivel de estrés diario?", name: "estres" },
    { label: "¿Sueles sentirte con poca energía o fatiga durante el día?", name: "fatiga" },
    { label: "¿Con qué frecuencia comes fuera de casa por motivos de estudio o trabajo?", name: "comer_fuera" },
  ];

  return (
    <form className="reco-form" onSubmit={handleSubmit}>
      <h3 className="reco-title">Formulario de Recomendación Nutricional</h3>

      {preguntas.map(({ label, name }) => (
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
            <option value="Nunca">Nunca</option>
            <option value="Rara vez">Rara vez</option>
            <option value="A veces">A veces</option>
            <option value="Frecuentemente">Frecuentemente</option>
            <option value="Siempre">Siempre</option>
          </select>
        </label>
      ))}
    </form>
  );
};

export default RecommendationForm;
