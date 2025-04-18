import React, { useState } from "react";

const BloodAnalysisForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "Male",
    smoking_history: "Never",
    bmi: "",
    hbA1c: "",
    blood_glucose_level: "",
    hemoglobin: "",
    insulin: "",
    triglycerides: "",
    hematocrit: "",
    red_blood_cells: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Formulario de Análisis de Sangre</h3>

      <label>Edad:
        <input type="number" name="age" value={formData.age} onChange={handleChange} required />
      </label><br />

      <label>Género:
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="Male">Masculino</option>
          <option value="Female">Femenino</option>
        </select>
      </label><br />

      <label>Historial de tabaquismo:
        <select name="smoking_history" value={formData.smoking_history} onChange={handleChange} required>
          <option value="Never">Nunca</option>
          <option value="Former">Ex fumador</option>
          <option value="Current">Fumador actual</option>
          <option value="Ever">Ha fumado alguna vez</option>
          <option value="No Info">Sin información</option>
        </select>
      </label><br />

      <label>IMC:
        <input type="number" name="bmi" step="0.1" value={formData.bmi} onChange={handleChange} required />
      </label><br />

      <label>HbA1c (%):
        <input type="number" name="hbA1c" step="0.1" value={formData.hbA1c} onChange={handleChange} required />
      </label><br />

      <label>Glucosa en sangre (mg/dL):
        <input type="number" name="blood_glucose_level" step="0.1" value={formData.blood_glucose_level} onChange={handleChange} required />
      </label><br />

      <label>Hemoglobina (g/dL):
        <input type="number" name="hemoglobin" step="0.1" value={formData.hemoglobin} onChange={handleChange} required />
      </label><br />

      <label>Insulina:
        <input type="number" name="insulin" step="0.1" value={formData.insulin} onChange={handleChange} required />
      </label><br />

      <label>Triglicéridos:
        <input type="number" name="triglycerides" step="0.1" value={formData.triglycerides} onChange={handleChange} required />
      </label><br />

      <label>Hematocrito (%):
        <input type="number" name="hematocrit" step="0.1" value={formData.hematocrit} onChange={handleChange} required />
      </label><br />

      <label>Glóbulos rojos (millones/µL):
        <input type="number" name="red_blood_cells" step="0.1" value={formData.red_blood_cells} onChange={handleChange} required />
      </label><br />

      <button type="submit">Enviar análisis</button>
    </form>
  );
};

export default BloodAnalysisForm;
