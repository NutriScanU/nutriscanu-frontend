import React, { useState } from "react";

const RecommendationForm = ({ onSubmit }) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(Object.values(formData)); // ✅ Se envía como lista
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Formulario de Recomendación Nutricional</h2>

      <label>¿Cuántas comidas realizas al día?
        <select name="comidas_dia" value={formData.comidas_dia} onChange={handleChange} required>
          <option value="">-- Selecciona --</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
        </select>
      </label><br /><br />

      <label>¿Cuántas veces a la semana consumes frutas y verduras?
        <select name="frutas_verduras" value={formData.frutas_verduras} onChange={handleChange} required>
          <option value="">-- Selecciona --</option>
          <option>0-1</option>
          <option>2-3</option>
          <option>4-5</option>
          <option>6-7</option>
        </select>
      </label><br /><br />

      <label>¿Tienes alguna alergia o intolerancia alimentaria?
        <select name="alergias" value={formData.alergias} onChange={handleChange} required>
          <option value="">-- Selecciona --</option>
          <option>Soy vegetariano/a</option>
          <option>Soy vegano/a</option>
          <option>Intolerancia a la lactosa</option>
          <option>Alergia al pescado o mariscos</option>
          <option>Alergia a frutos secos</option>
          <option>Alergia al gluten</option>
          <option>Ninguna</option>
        </select>
      </label><br /><br />

      <label>¿Consumes bebidas azucaradas frecuentemente?
        <select name="bebidas_azucaradas" value={formData.bebidas_azucaradas} onChange={handleChange} required>
          <option value="">-- Selecciona --</option>
          <option>Nunca</option>
          <option>1-2 veces por semana</option>
          <option>3-5 veces</option>
          <option>Diariamente</option>
        </select>
      </label><br /><br />

      <label>¿Qué tan activo eres físicamente durante la semana?
        <select name="actividad" value={formData.actividad} onChange={handleChange} required>
          <option value="">-- Selecciona --</option>
          <option>Sedentario</option>
          <option>Moderado</option>
          <option>Activo</option>
        </select>
      </label><br /><br />

      <label>¿Cuál es tu objetivo principal con tu alimentación?
        <select name="objetivo" value={formData.objetivo} onChange={handleChange} required>
          <option value="">-- Selecciona --</option>
          <option>Mantener peso</option>
          <option>Bajar</option>
          <option>Subir</option>
          <option>Mejorar salud</option>
        </select>
      </label><br /><br />

      <label>¿Consumes alimentos ultraprocesados (fast food, snacks, embutidos)?
        <select name="ultraprocesados" value={formData.ultraprocesados} onChange={handleChange} required>
          <option value="">-- Selecciona --</option>
          <option>Nunca</option>
          <option>1-2 veces por semana</option>
          <option>3+ veces</option>
        </select>
      </label><br /><br />

      <label>¿Cómo calificarías tu nivel de estrés diario?
        <select name="estres" value={formData.estres} onChange={handleChange} required>
          <option value="">-- Selecciona --</option>
          <option>Bajo</option>
          <option>Moderado</option>
          <option>Alto</option>
          <option>Muy alto</option>
        </select>
      </label><br /><br />

      <label>¿Sueles sentirte con poca energía o fatiga durante el día?
        <select name="fatiga" value={formData.fatiga} onChange={handleChange} required>
          <option value="">-- Selecciona --</option>
          <option>Sí</option>
          <option>No</option>
          <option>A veces</option>
        </select>
      </label><br /><br />

      <label>¿Con qué frecuencia comes fuera de casa por motivos de estudio o trabajo?
        <select name="comer_fuera" value={formData.comer_fuera} onChange={handleChange} required>
          <option value="">-- Selecciona --</option>
          <option>Casi nunca</option>
          <option>1-2 veces por semana</option>
          <option>3-5 veces por semana</option>
          <option>Todos los días</option>
        </select>
      </label><br /><br />

      <button type="submit">Enviar respuestas</button>
    </form>
  );
};

export default RecommendationForm;
