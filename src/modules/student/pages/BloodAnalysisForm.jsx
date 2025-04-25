import React, { useState, useEffect } from "react";
import "./BloodAnalysisForm.css"; // CSS exclusivo

const BloodAnalysisForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "", // ❌ Ninguno seleccionado por defecto
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
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="blood-form" onSubmit={handleSubmit}>
      <h3 className="blood-title">Formulario de Análisis de Sangre</h3>

      {/* Edad */}
      <div className="blood-form-group">
        <label className="blood-label">
          Edad:
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            className="blood-input"
          />
        </label>
      </div>

      {/* GÉNERO vertical con radio relleno */}
      <div className="blood-form-row-vertical">
        <label className="blood-inline-label">Género:</label>
        <div className="blood-radio-column">
          <label className="blood-radio-option">
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={formData.gender === "Male"}
              onChange={handleChange}
            />
            <span className="blood-radio-filled"></span>
            <span className="blood-radio-label">Masculino</span>
          </label>
          <label className="blood-radio-option">
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={formData.gender === "Female"}
              onChange={handleChange}
            />
            <span className="blood-radio-filled"></span>
            <span className="blood-radio-label">Femenino</span>
          </label>
        </div>
      </div>

      {/* Historial de tabaquismo */}
      <div className="blood-form-group">
        <label className="blood-label">
          Historial de tabaquismo:
          <select
            name="smoking_history"
            value={formData.smoking_history}
            onChange={handleChange}
            required
            className="blood-input"
          >
            <option value="Never">Nunca</option>
            <option value="Current">Actual</option>
            <option value="Former">Anterior</option>
            <option value="Ever">Alguna vez</option>
            <option value="Not Current">No actualmente</option>
            <option value="No Info">Sin información</option>
          </select>
        </label>
      </div>

      {/* Campos clínicos */}
      <div className="blood-form-grid">
        {[
          { label: "IMC:", name: "bmi" },
          { label: "HbA1c (%):", name: "hbA1c" },
          { label: "Glucosa en sangre (mg/dL):", name: "blood_glucose_level" },
          { label: "Hemoglobina (g/dL):", name: "hemoglobin" },
          { label: "Insulina:", name: "insulin" },
          { label: "Triglicéridos:", name: "triglycerides" },
          { label: "Hematocrito (%):", name: "hematocrit" },
          { label: "Glóbulos rojos (millones/μL):", name: "red_blood_cells" },
        ].map((field, index) => (
          <label key={index} className="blood-label">
            {field.label}
            <input
              type="number"
              step="0.1"
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required
              className="blood-input"
            />
          </label>
        ))}
      </div>
    </form>
  );
};

export default BloodAnalysisForm;
