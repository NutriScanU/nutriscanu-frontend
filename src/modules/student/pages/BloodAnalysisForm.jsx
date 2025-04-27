import React, { useState, useEffect } from "react";
import "./BloodAnalysisForm.css";

const BloodAnalysisForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    smoking_history: "",
    bmi: "",
    hbA1c: "",
    blood_glucose_level: "",
    hemoglobin: "",
    insulin: "",
    triglycerides: "",
    hematocrit: "",
    red_blood_cells: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const fieldLabels = {
    bmi: "Índice de Masa Corporal (IMC)",
    hbA1c: "Hemoglobina glicosilada (HbA1c %)",
    blood_glucose_level: "Glucosa en sangre (mg/dL)",
    hemoglobin: "Hemoglobina (g/dL)",
    insulin: "Insulina (µU/mL)",
    triglycerides: "Triglicéridos (mg/dL)",
    hematocrit: "Hematocrito (%)",
    red_blood_cells: "Glóbulos rojos (millones/μL)"
  };

  const validateField = (name, value) => {
    if (value.trim() === "") {
      setErrors((prev) => ({ ...prev, [name]: "⚠️ Este campo es obligatorio" }));
      return;
    }

    const num = parseFloat(value);

    if (name === "age") {
      if (isNaN(num) || num < 16 || num > 35) {
        setErrors((prev) => ({ ...prev, [name]: "⚠️ La edad debe estar entre 16 y 35 años" }));
        return;
      }
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    validateField(name, value);
  };

  const validateAllFields = (data) => {
    const newErrors = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value.trim() === "") {
        newErrors[key] = "⚠️ Este campo es obligatorio";
      } else if (key === "age") {
        const num = parseFloat(value);
        if (isNaN(num) || num < 16 || num > 35) {
          newErrors[key] = "⚠️ La edad debe estar entre 16 y 35 años";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateAllFields(formData);
    if (isValid) {
      onSubmit(formData);
    }
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
            onWheel={(e) => e.target.blur()}
            className={`blood-input ${errors.age ? "error-input" : ""}`}
          />
          {errors.age ? (
            <span className="blood-error-text">{errors.age}</span>
          ) : (
            <span className="blood-hint-text">Edad permitida: entre 16 y 35 años</span>
          )}
        </label>
      </div>

      {/* Género */}
      <div className="blood-form-row-vertical">
        <label className="blood-inline-label">Género:</label>
        <div className="blood-radio-column">
          {["Male", "Female"].map((option) => (
            <label key={option} className="blood-radio-option">
              <input
                type="radio"
                name="gender"
                value={option}
                checked={formData.gender === option}
                onChange={handleChange}
              />
              <span className="blood-radio-filled"></span>
              <span className="blood-radio-label">
                {option === "Male" ? "Masculino" : "Femenino"}
              </span>
            </label>
          ))}
        </div>
        {errors.gender && <span className="blood-error-text">{errors.gender}</span>}
      </div>

      {/* Historial de tabaquismo */}
      <div className="blood-form-group">
        <label className="blood-label">
          Historial de tabaquismo:
          <select
            name="smoking_history"
            value={formData.smoking_history}
            onChange={handleChange}
            className={`blood-input ${errors.smoking_history ? "error-input" : ""}`}
          >
            <option value="" disabled hidden>-- Selecciona --</option>
            <option value="Never">Nunca</option>
            <option value="Current">Actualmente</option>
            <option value="Former">Anteriormente</option>
            <option value="Ever">Alguna vez</option>
            <option value="Not Current">No actualmente</option>
            <option value="No Info">Prefiero no decirlo</option>
          </select>
          {errors.smoking_history && (
            <span className="blood-error-text">{errors.smoking_history}</span>
          )}
        </label>
      </div>

      {/* Campos clínicos */}
      <div className="blood-form-grid">
        {Object.keys(fieldLabels).map((field) => (
          <label key={field} className="blood-label">
            {fieldLabels[field]}:
            <input
              type="number"
              name={field}
              step="0.1"
              value={formData[field]}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
              className={`blood-input ${errors[field] ? "error-input" : ""}`}
            />
            {errors[field] && <span className="blood-error-text">{errors[field]}</span>}
          </label>
        ))}
      </div>


    </form>
  );
};

export default BloodAnalysisForm;
