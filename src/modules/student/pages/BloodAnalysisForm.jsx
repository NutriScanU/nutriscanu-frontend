import React, { useState, useEffect, useMemo } from "react";
import "./BloodAnalysisForm.css";

// Función para validar números y sus rangos
const validateNumericField = (name, value, range) => {
  const validNumber = /^\d+(\.\d{1,2})?$/;
  if (!value.trim()) return "Falta llenar este campo";
  if (value.startsWith('.')) return "El valor debe tener un número antes del punto decimal (ejemplo: 0.22)";
  if (value.includes(',')) return "No se permite el uso de comas, use solo punto (.)";
  if ((value.match(/\./g) || []).length > 1) return "Solo se permite un punto decimal";
  if (!validNumber.test(value)) return "Solo se permiten hasta 2 decimales";
  if (!range) return ""; // Si no hay rango definido, no validar rango
  const numValue = parseFloat(value);
  if (numValue < range.min || numValue > range.max) return `Debe estar entre ${range.min} y ${range.max}`;
  return "";
};

const BloodAnalysisForm = ({ onSubmit, initialData, isReadOnly = false }) => {
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

  const numericFields = [
    "age", "bmi", "hbA1c", "blood_glucose_level", "hemoglobin", "insulin", "triglycerides", "hematocrit", "red_blood_cells"
  ];

  // Rango de valores para cada campo numérico
  const ranges = useMemo(() => ({
  age: { min: 16, max: 35 },
  // bmi: { min: 10, max: 40 },
  // hbA1c: { min: 3, max: 15 },
  // blood_glucose_level: { min: 40, max: 300 },
  // hemoglobin: { min: 8, max: 20 },
  // insulin: { min: 1, max: 50 },
  // triglycerides: { min: 30, max: 500 },
  // hematocrit: { min: 20, max: 60 },
  // red_blood_cells: { min: 3, max: 7 }
  }), []);

  // Etiquetas de los campos
  const fieldLabels = useMemo(() => ({
    bmi: "Índice de Masa Corporal (IMC)",
    hbA1c: "Hemoglobina glicosilada (HbA1c %)",
    blood_glucose_level: "Glucosa en sangre (mg/dL)",
    hemoglobin: "Hemoglobina (g/dL)",
    insulin: "Insulina (µU/mL)",
    triglycerides: "Triglicéridos (mg/dL)",
    hematocrit: "Hematocrito (%)",
    red_blood_cells: "Glóbulos rojos (millones/μL)"
  }), []);

  // Usamos useEffect para inicializar los datos
  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const getHint = (field) => {
    const range = ranges[field];
    if (!range) return "";
    return `Valor permitido: entre ${range.min} y ${range.max}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (numericFields.includes(name)) {
      const range = ranges[name];
      // Solo validar si hay rango definido
      const error = range ? validateNumericField(name, value, range) : "";
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else {
      if (submitted && value.trim() !== "") {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
  };

  const validateAllFields = (data) => {
    const newErrors = {};
    if (!data.gender) newErrors.gender = "Debe seleccionar un género";
    if (!data.smoking_history || data.smoking_history === "") newErrors.smoking_history = "Debe seleccionar una opción";

    Object.entries(data).forEach(([key, value]) => {
      const stringValue = String(value || "");
      const range = ranges[key];

      if (!stringValue.trim()) newErrors[key] = "Falta llenar este campo";
      else if (key === "age" && !/^\d+$/.test(stringValue)) newErrors[key] = "Solo se permiten números enteros";
      else if (numericFields.includes(key)) {
        const error = validateNumericField(key, stringValue, range);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) {
      onSubmit(formData);
      return;
    }
    setSubmitted(true);
    const newErrors = validateAllFields(formData);
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <div className={`blood-form-container ${isReadOnly ? 'readonly-mode' : ''}`}>
      {isReadOnly && (
        <div className="readonly-header">
          <div className="readonly-icon">👁️</div>
          <div className="readonly-content">
            <h3>Análisis Registrado (Solo Lectura)</h3>
            <p>Estos son los datos de tu análisis de sangre ya registrado. No pueden ser modificados.</p>
          </div>
        </div>
      )}
      <form className="blood-form" onSubmit={handleSubmit}>
        <h3 className="blood-title">
          {isReadOnly ? "Datos de tu Análisis" : "Formulario de Análisis de Sangre"}
        </h3>

        <div className="blood-form-group">
          <label className="blood-label">
            Edad:
            <input
              type="number"
              name="age"
              value={formData.age}
              inputMode="numeric"
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
              onKeyDown={(e) => {
                const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className={`blood-input ${errors.age ? "error-input" : ""} ${isReadOnly ? "readonly-input" : ""}`}
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            {!isReadOnly && errors.age ? (
              <span className="blood-error-text">⚠️ {errors.age}</span>
            ) : (
              !isReadOnly && getHint("age") && <span className="blood-hint-text">{getHint("age")}</span>
            )}
          </label>
        </div>

        <div className="blood-form-row-vertical">
          <label className="blood-inline-label">Género:</label>
          <div className="blood-radio-column">
            {["Male", "Female"].map((option) => (
              <label key={option} className={`blood-radio-option ${isReadOnly ? 'readonly-radio' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={formData.gender === option}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
                <span className="blood-radio-filled"></span>
                <span className="blood-radio-label">
                  {option === "Male" ? "Masculino" : "Femenino"}
                </span>
              </label>
            ))}
          </div>
          {!isReadOnly && errors.gender && <span className="blood-error-text">⚠️ {errors.gender}</span>}
        </div>

        <div className="blood-form-group">
          <label className="blood-label">
            Historial de tabaquismo:
            <select
              name="smoking_history"
              value={formData.smoking_history}
              onChange={handleChange}
              className={`blood-input ${errors.smoking_history ? "error-input" : ""} ${isReadOnly ? "readonly-input" : ""}`}
              disabled={isReadOnly}
            >
              <option value="">-- Selecciona --</option>
              <option value="Never">Nunca</option>
              <option value="Current">Actualmente</option>
              <option value="Former">Anteriormente</option>
              <option value="Ever">Alguna vez</option>
              <option value="Not Current">No actualmente</option>
              <option value="No Info">Prefiero no decirlo</option>
            </select>
            {!isReadOnly && errors.smoking_history && (
              <span className="blood-error-text">⚠️ {errors.smoking_history}</span>
            )}
          </label>
        </div>

        <div className="blood-form-grid">
          {Object.keys(fieldLabels).map((field) => (
            <label key={field} className="blood-label">
              {fieldLabels[field]}:
              <input
                type="text"
                name={field}
                step="0.1"
                value={formData[field]}
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => {
                  const allowedKeys = [
                    "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "."
                  ];
                  if (e.key === ",") {
                    e.preventDefault();
                  } else if (e.key === "." && e.currentTarget.value.includes(".")) {
                    // Bloquea escribir un segundo punto
                    e.preventDefault();
                  } else if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`blood-input ${errors[field] ? "error-input" : ""} ${isReadOnly ? "readonly-input" : ""}`}
                readOnly={isReadOnly}
                disabled={isReadOnly}
              />
              {!isReadOnly && errors[field] ? (
                <span className="blood-error-text">⚠️ {errors[field]}</span>
              ) : (
                !isReadOnly && getHint(field) && <span className="blood-hint-text">{getHint(field)}</span>
              )}
            </label>
          ))}
        </div>
      </form>
    </div>
  );
};

export default BloodAnalysisForm;
