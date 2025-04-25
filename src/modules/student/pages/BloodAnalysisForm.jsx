import React, { useState, useEffect } from "react";
import "../../../styles/BloodAnalysisForm.css";

const BloodAnalysisForm = ({ onSubmit, initialData }) => {
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
    onSubmit(formData); // Enviamos el objeto completo
  };

  return (
    <form className="blood-form" onSubmit={handleSubmit}>
      <h3 className="blood-title">Formulario de Análisis de Sangre</h3>

      <label className="form-label">
        Edad:
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          required
        />
      </label>

      <label className="form-label">
        Género:
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="Male">Masculino</option>
          <option value="Female">Femenino</option>
        </select>
      </label>

      <label className="form-label">
        Historial de tabaquismo:
        <select
          name="smoking_history"
          value={formData.smoking_history}
          onChange={handleChange}
          required
        >
          <option value="Never">Nunca</option>
          <option value="Current">Actual</option>
          <option value="Former">Anterior</option>
          <option value="Ever">Alguna vez</option>
          <option value="Not Current">No actualmente</option>
          <option value="No Info">Sin información</option>
        </select>
      </label>

      <label className="form-label">
        IMC:
        <input
          type="number"
          step="0.1"
          name="bmi"
          value={formData.bmi}
          onChange={handleChange}
          required
        />
      </label>

      <label className="form-label">
        HbA1c (%):
        <input
          type="number"
          step="0.1"
          name="hbA1c"
          value={formData.hbA1c}
          onChange={handleChange}
          required
        />
      </label>

      <label className="form-label">
        Glucosa en sangre (mg/dL):
        <input
          type="number"
          name="blood_glucose_level"
          value={formData.blood_glucose_level}
          onChange={handleChange}
          required
        />
      </label>

      <label className="form-label">
        Hemoglobina (g/dL):
        <input
          type="number"
          step="0.1"
          name="hemoglobin"
          value={formData.hemoglobin}
          onChange={handleChange}
          required
        />
      </label>

      <label className="form-label">
        Insulina:
        <input
          type="number"
          name="insulin"
          value={formData.insulin}
          onChange={handleChange}
          required
        />
      </label>

      <label className="form-label">
        Triglicéridos:
        <input
          type="number"
          name="triglycerides"
          value={formData.triglycerides}
          onChange={handleChange}
          required
        />
      </label>

      <label className="form-label">
        Hematocrito (%):
        <input
          type="number"
          step="0.1"
          name="hematocrit"
          value={formData.hematocrit}
          onChange={handleChange}
          required
        />
      </label>

      <label className="form-label">
        Glóbulos rojos (millones/μL):
        <input
          type="number"
          step="0.1"
          name="red_blood_cells"
          value={formData.red_blood_cells}
          onChange={handleChange}
          required
        />
      </label>
    </form>
  );
};

export default BloodAnalysisForm;
