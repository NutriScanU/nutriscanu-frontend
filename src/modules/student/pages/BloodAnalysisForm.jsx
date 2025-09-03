import React, { useState, useEffect } from "react";
import "./BloodAnalysisForm.css";

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
    "age",
    "bmi",
    "hbA1c",
    "blood_glucose_level",
    "hemoglobin",
    "insulin",
    "triglycerides",
    "hematocrit",
    "red_blood_cells"
  ];

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
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (numericFields.includes(name)) {
      validateField(name, value);
    } else {
      // Si ya se había intentado enviar, validamos todo de nuevo
      if (submitted) {
        const newErrors = { ...errors };
        if (value.trim() !== "") {
          delete newErrors[name];
        }
        setErrors(newErrors);
      }
    }
  };

  const validateField = (name, value) => {
    if (!numericFields.includes(name)) return; // 👉 Evita validar género/tabaquismo como números

    const validNumber = /^\d+(\.\d+)?$/;

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: "Falta llenar este campo" }));
    } else if (!validNumber.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: "Debe ingresar solo números válidos, sin letras ni espacios" }));
    } else {
      if (name === "age") {
        const ageNum = parseInt(value);
        if (ageNum < 16 || ageNum > 35) {
          setErrors((prev) => ({ ...prev, [name]: "Debe estar entre 16 y 35" }));
          return;
        }
      }
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };


  const validateAllFields = (data) => {
    const newErrors = {};
    const validNumber = /^\d+(\.\d+)?$/;

    if (!data.gender) {
      newErrors.gender = "Debe seleccionar un género";
    }

    if (!data.smoking_history || data.smoking_history === "") {
      newErrors.smoking_history = "Debe seleccionar una opción";
    }

    Object.entries(data).forEach(([key, value]) => {
      // 🔧 Convertir a string para evitar errores con números
      const stringValue = String(value || "");
      
      if (!stringValue.trim()) {
        newErrors[key] = "Falta llenar este campo";
      } else if (numericFields.includes(key) && !validNumber.test(stringValue)) {
        newErrors[key] = "Debe ingresar solo números válidos, sin letras ni espacios";
      } else if (key === "age") {
        const ageNum = parseInt(stringValue);
        if (ageNum < 16 || ageNum > 35) {
          newErrors[key] = "Debe estar entre 16 y 35";
        }
      }

    });

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 🚫 NO validar si está en modo de solo lectura
    if (isReadOnly) {
      // En modo solo lectura, simplemente pasamos los datos sin validar
      onSubmit(formData);
      return;
    }
    
    // ✅ Validación normal solo si NO está en modo de solo lectura
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
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
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
                type="number"
                name={field}
                step="0.1"
                value={formData[field]}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
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
