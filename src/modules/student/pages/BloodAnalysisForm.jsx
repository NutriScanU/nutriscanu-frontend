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
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const ranges = {
    age: { min: 16, max: 35 },

  };

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

  const getHint = (field) => {
    const range = ranges[field];
    if (!range) return "";

    if (typeof range === "object" && range.Male) {
      if (!formData.gender) return "";
      const { min, max } = range[formData.gender];
      return `Valor permitido: entre ${min} y ${max}`;
    }

    return `Valor permitido: entre ${range.min} y ${range.max}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "gender") {
      const updated = { ...formData, [name]: value };
      setFormData(updated);
      if (submitted) validateAllFields(updated);
    } else {
      const updated = { ...formData, [name]: value };
      setFormData(updated);
      validateField(name, value, formData.gender);
    }
  };

  const validateField = (name, value, gender) => {
    const range = ranges[name];
    if (!range) return;

    let min = range.min;
    let max = range.max;

    if (typeof range === "object" && range.Male && gender) {
      min = range[gender]?.min;
      max = range[gender]?.max;
    }

    const num = parseFloat(value);

    if (!value) {
      setErrors((prev) => ({ ...prev, [name]: "Falta llenar este campo" }));
    } else if (isNaN(num)) {
      setErrors((prev) => ({ ...prev, [name]: "Debe ser un número válido" }));
    } else if (num < min || num > max) {
      setErrors((prev) => ({ ...prev, [name]: `Debe estar entre ${min} y ${max}` }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateAllFields = (data) => {
    const newErrors = {};

    Object.entries(data).forEach(([key, value]) => {
      const range = ranges[key];
      if (!range) return;

      let min = range.min;
      let max = range.max;

      if (typeof range === "object" && range.Male && data.gender) {
        min = range[data.gender]?.min;
        max = range[data.gender]?.max;
      }

      const num = parseFloat(value);

      if (!value) {
        newErrors[key] = "Falta llenar este campo";
      } else if (isNaN(num)) {
        newErrors[key] = "Debe ser un número válido";
      } else if (num < min || num > max) {
        newErrors[key] = `Debe estar entre ${min} y ${max}`;
      }
    });

    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    validateAllFields(formData);
    if (Object.keys(errors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <form className="blood-form" onSubmit={handleSubmit}>
      <h3 className="blood-title">Formulario de Análisis de Sangre</h3>

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
            <span className="blood-error-text">⚠️ {errors.age}</span>
          ) : (
            getHint("age") && <span className="blood-hint-text">{getHint("age")}</span>
          )}
        </label>
      </div>

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
        {errors.gender && <span className="blood-error-text">⚠️ {errors.gender}</span>}
      </div>

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
            <span className="blood-error-text">⚠️ {errors.smoking_history}</span>
          )}
        </label>
      </div>

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
            {errors[field] ? (
              <span className="blood-error-text">⚠️ {errors[field]}</span>
            ) : (
              getHint(field) && <span className="blood-hint-text">{getHint(field)}</span>
            )}
          </label>
        ))}
      </div>
    </form>
  );
};

export default BloodAnalysisForm;
