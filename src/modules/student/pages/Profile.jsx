import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './Profile.css';

// Capitaliza cada palabra de un string (CORREGIDA para apostrofes)
const capitalizeWords = (str) => {
  if (!str) return '';
  
  return str
    .split(' ')
    .map(word => {
      // Si la palabra contiene apostrofe, manejar cada parte por separado
      if (word.includes("'")) {
        return word
          .split("'")
          .map(part => {
            if (part.length === 0) return '';
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          })
          .join("'");
      }
      
      // Si la palabra contiene guión, manejar cada parte por separado
      if (word.includes('-')) {
        return word
          .split('-')
          .map(part => {
            if (part.length === 0) return '';
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          })
          .join('-');
      }
      
      // Palabra normal (esto manejará correctamente la ñ)
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

const Profile = () => {
  // Estados del componente
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localProbability, setLocalProbability] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [tempFirstName, setTempFirstName] = useState('');
  const [tempMiddleName, setTempMiddleName] = useState('');
  const [tempLastName, setTempLastName] = useState('');
  const [errors, setErrors] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false); // Nuevo estado

  const navigate = useNavigate();
  const apiBase = process.env.REACT_APP_API_URL;

  // Función para traducir las condiciones de salud
  const translateCondition = (condition) => {
    switch (condition) {
      case 'Healthy':
        return 'Saludable';
      case 'Diabetes':
        return 'Diabetes';
      case 'Anemia':
        return 'Anemia';
      case 'Ambos':
      case 'Both':
        return 'Diabetes y Anemia';
      default:
        return 'No disponible';
    }
  };

  // Función que se ejecuta al montar el componente (useEffect)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiBase}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        setProfileData(res.data);

        // Iniciar animación para la probabilidad
        if (res.data.probability !== undefined) {
          setLocalProbability(0);
          let increment = 1;
          const targetProbability = res.data.probability;
          const interval = setInterval(() => {
            setLocalProbability((prev) => {
              if (prev < targetProbability) {
                return prev + increment;
              } else {
                clearInterval(interval);
                return targetProbability;
              }
            });
          }, 30); // Incrementa cada 30ms
        }
      } catch (err) {
        
        setError('No se pudo cargar tu información en este momento. Intenta nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [apiBase]);

  // Función para manejar la edición del nombre
  const handleEditName = () => {
    setTempFirstName('');
    setTempMiddleName('');
    setTempLastName('');
    setErrors({});
    setShowEditModal(true);
  };

  // Función para abrir el modal de confirmación
  const handleOpenConfirm = () => {
    if (validateFields()) setShowConfirmModal(true);
  };

  // Función para limpiar y normalizar texto
const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ')  // Reemplaza múltiples espacios por uno solo
    .trim();               // Elimina espacios al inicio y final
};

  // Función para confirmar el guardado de nuevos datos
  const handleConfirmSave = async () => {
    setUpdateLoading(true); // Activar loading
    try {
      const token = localStorage.getItem('token');
      
      // Limpiar campos antes de enviar
      const cleanFirstName = cleanText(tempFirstName);
      const cleanLastName = cleanText(tempLastName);
      const cleanMiddleName = cleanText(tempMiddleName);
      
      await axios.put(`${apiBase}/api/students/update-name`, {
        first_name: capitalizeWords(cleanFirstName),
        middle_name: capitalizeWords(cleanMiddleName),
        last_name: capitalizeWords(cleanLastName)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          first_name: capitalizeWords(cleanFirstName),
          middle_name: capitalizeWords(cleanMiddleName),
          last_name: capitalizeWords(cleanLastName)
        }
      }));

      // Mostrar mensaje de éxito
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000); // Mostrar por 3 segundos

      setShowConfirmModal(false);
      setShowEditModal(false);
    } catch (err) {
      console.error('❌ Error al actualizar nombre:', err);
      
      // Manejar errores específicos del backend
      if (err.response?.status === 400 && err.response?.data?.errors) {
        // Errores de validación del backend
        const backendErrors = err.response.data.errors;
        const frontendErrors = {};
        
        if (backendErrors.first_name) frontendErrors.firstName = backendErrors.first_name;
        if (backendErrors.middle_name) frontendErrors.middleName = backendErrors.middle_name;
        if (backendErrors.last_name) frontendErrors.lastName = backendErrors.last_name;
        
        setErrors(frontendErrors);
      } else {
        // Error genérico
        setErrors({
          general: 'Error al actualizar el nombre. Intenta nuevamente.'
        });
      }
    } finally {
      setUpdateLoading(false); // Desactivar loading
    }
  };

  // Función para cancelar la edición de nombre
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setErrors({});
  };

  // Función para cancelar la confirmación
  const handleCancelConfirm = () => setShowConfirmModal(false);

  // Función para manejar cambios en los campos de entrada (CORREGIDA)
  const handleInputChange = (setter, fieldName) => (e) => {
    let value = e.target.value;
    
    // 1. BLOQUEAR caracteres completamente inválidos (CORREGIDO)
    const invalidChars = /[0-9!@#$%^&*()_+=[\]{};:"\\|,.<>/?`~]/;
    if (invalidChars.test(value)) {
      return; // No permitir la entrada
    }
    
    // 2. Limitar espacios consecutivos (máximo 1)
    if (/\s{2,}/.test(value)) {
      return; // No permitir más de 1 espacio consecutivo
    }
    
    // 3. Limitar guiones consecutivos (máximo 1)
    if (/[-]{2,}/.test(value)) {
      return; // No permitir más de 1 guión consecutivo
    }
    
    // 4. Limitar apostrofes consecutivos (máximo 1)
    if (/[']{2,}/.test(value)) {
      return; // No permitir más de 1 apostrofe consecutivo
    }
    
    // 5. No permitir espacios al inicio
    if (value.startsWith(' ') && value.length === 1) {
      return; // No permitir que empiece con espacio
    }
    
    // 6. No permitir que empiece con guión
    if (value.startsWith('-')) {
      return;
    }
    
    // 7. Limitar longitud total
    if (value.length > 50) {
      return;
    }
    
    // 8. Solo letras, acentos, espacios, guiones y apostrofes (INCLUIR Ññ)
    const allowedChars = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s'-]*$/;
    if (!allowedChars.test(value)) {
      return;
    }
    
    setter(value);
    
    // ✅ VALIDACIÓN EN TIEMPO REAL MEJORADA
    const cleanedValue = cleanText(value);
    
    if (!cleanedValue) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Falta llenar este campo.' }));
    } else if (cleanedValue.length < 2) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Este campo debe tener al menos 2 caracteres.' }));
    } else if (cleanedValue.length > 50) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Máximo 50 caracteres permitidos.' }));
    } else if (/^\s+$/.test(value)) {
      setErrors(prev => ({ ...prev, [fieldName]: 'No puede contener solo espacios.' }));
    } else if (/^[-'\s]+$/.test(cleanedValue)) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Debe contener al menos una letra.' }));
    } else if (/[-]{2,}/.test(cleanedValue)) {
      setErrors(prev => ({ ...prev, [fieldName]: 'No se permiten guiones consecutivos.' }));
    } else if (/[']{2,}/.test(cleanedValue)) {
      setErrors(prev => ({ ...prev, [fieldName]: 'No se permiten apostrofes consecutivos.' }));
    } else if (value.endsWith("'") || value.endsWith("-")) {
      setErrors(prev => ({ ...prev, [fieldName]: 'No puede terminar con apóstrofe ni guión.' }));
    } else if (/(.)\1{4,}/.test(cleanedValue)) {
      // ✅ AQUÍ ESTÁ: Mostrar error INMEDIATAMENTE cuando escribes 5+ caracteres repetidos
      setErrors(prev => ({ ...prev, [fieldName]: 'No se permiten caracteres repetidos excesivamente.' }));
    } else {
      // Limpiar errores si está válido
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  // Validación final antes de guardar (CORREGIDA)
  const validateFields = () => {
    const newErrors = {};
    
    // Limpiar todos los campos
    const cleanFirstName = cleanText(tempFirstName);
    const cleanLastName = cleanText(tempLastName);
    const cleanMiddleName = cleanText(tempMiddleName);
    
    // Regex exacta del backend (INCLUIR Ññ)
    const validNamePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ']([A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s'-]*[A-Za-zÁÉÍÓÚáéíóúÑñüÜ])?$/;
    
    // Función auxiliar para validar un campo (sincronizada con backend)
    const validateField = (value, fieldDisplayName) => {
      if (!value) return 'Falta llenar este campo.';
      if (value.length < 2) return 'Debe tener al menos 2 caracteres.';
      if (value.length > 50) return 'No puede superar 50 caracteres.';
      if (!validNamePattern.test(value)) return 'Formato inválido. Solo letras, espacios, guiones y apóstrofes.';
      if (/\s{2,}/.test(value)) return 'No se permiten espacios consecutivos.';
      if (/[-]{2,}/.test(value)) return 'No se permiten guiones consecutivos.';
      if (/[']{2,}/.test(value)) return 'No se permiten apóstrofes consecutivos.';
      if (value.startsWith('-')) return 'No puede empezar con guión.';
      if (value.endsWith("'") || value.endsWith("-")) return 'No puede terminar con apóstrofe ni guión. Debe terminar con una letra.';
      if (!/[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]$/.test(value)) return 'Debe terminar con una letra.';
      
      // Verificar que tenga al menos 2 letras (INCLUIR Ññ)
      const letterCount = (value.match(/[A-Za-zÁÉÍÓÚáéíóúÑñüÜ]/g) || []).length;
      if (letterCount < 2) return 'Debe contener al menos 2 letras.';
      
      // Verificar patrones sospechosos
      if (/(.)\1{4,}/.test(value)) return 'No se permiten caracteres repetidos excesivamente.';
      
      return null;
    };
    
    // Validar cada campo
    const firstNameError = validateField(cleanFirstName, 'El nombre');
    const lastNameError = validateField(cleanLastName, 'El apellido paterno');
    const middleNameError = validateField(cleanMiddleName, 'El apellido materno');
    
    if (firstNameError) newErrors.firstName = firstNameError;
    if (lastNameError) newErrors.lastName = lastNameError;
    if (middleNameError) newErrors.middleName = middleNameError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Banner de error superior y función de reintento
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Repetir la lógica de fetchProfile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiBase}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        setProfileData(res.data);
        if (res.data.probability !== undefined) {
          setLocalProbability(0);
          let increment = 1;
          const targetProbability = res.data.probability;
          const interval = setInterval(() => {
            setLocalProbability((prev) => {
              if (prev < targetProbability) {
                return prev + increment;
              } else {
                clearInterval(interval);
                return targetProbability;
              }
            });
          }, 30);
        }
      } catch (err) {
        setError('No se pudo cargar tu información en este momento. Intenta nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  };

  if (loading) return <div className="loading">Cargando perfil...</div>;
  if (error || !profileData) {
    return (
      <div className="profile-container">
        <div className="error-banner">
          <span>{error || 'No se pudo cargar tu información en este momento. Intenta nuevamente más tarde.'}</span>
          <button className="retry-btn" onClick={handleRetry}>Reintentar</button>
        </div>
        <div className="profile-header">
          <button
  className="back-button"
  onClick={() => {
    if (!showEditModal && !showConfirmModal) navigate("/student/home");
  }}
  disabled={showEditModal || showConfirmModal}
  style={{
    opacity: showEditModal || showConfirmModal ? 0.4 : 1,
    pointerEvents: showEditModal || showConfirmModal ? 'none' : 'auto'
  }}
>
  ←
</button>
          <h2>PERFIL</h2>
        </div>
      </div>
    );
  }

  // Datos del perfil y lógica de la interfaz
  const { profile, health_condition, has_recommendation } = profileData;
  const fullName = `${profile?.first_name || ''}  ${profile?.last_name || ''} ${profile?.middle_name || ''}`;
  const profileImage = profile?.profile_image
    ? `${apiBase}${profile.profile_image}`
    : '/images/Student/Profile/default-profile.png';

  const getColorByCondition = () => {
    if (health_condition === 'Diabetes') return '#FF5733';
    if (health_condition === 'Anemia') return '#FF9F00';
    if (health_condition === 'Ambos') return '#5C6BC0';
    return '#4CAF50'; // Saludable
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button
  className="back-button"
  onClick={() => {
    if (!showEditModal && !showConfirmModal) navigate("/student/home");
  }}
  disabled={showEditModal || showConfirmModal}
  style={{
    opacity: showEditModal || showConfirmModal ? 0.4 : 1,
    pointerEvents: showEditModal || showConfirmModal ? 'none' : 'auto'
  }}
>
  ←
</button>
        <h2>PERFIL</h2>
      </div>

      <div className="profile-content">
        {/* Imagen de perfil (sin funcionalidad de edición) */}
        <div className="profile-image-wrapper">
          <img
            src={profileImage}
            alt="Foto de perfil"
            className="profile-image"
            onError={(e) => {
              e.target.src = '/images/Student/Profile/default-profile.png';
            }}
          />
        </div>

        <div className="profile-name">
          <h3>{fullName}</h3>
          <button className="edit-name-btn" onClick={handleEditName}>Editar nombre</button>
        </div>

        <div className="profile-health">
          <div className="health-info">
            <span className="health-status">Diagnóstico: {translateCondition(health_condition)}</span>

            <p className="probability-label">Probabilidad:</p>
          </div>

          <div className="health-meter" style={{ color: getColorByCondition() }}>
            <CircularProgressbar
              value={localProbability < 100 ? localProbability : 99.99}  // Evita que se llene completamente
              text={`${localProbability < 100 ? localProbability : 99.99}%`}
              strokeWidth={10}
              styles={{
                path: { stroke: getColorByCondition(), strokeLinecap: 'round' },
                trail: { stroke: '#e6e6e6' },
                text: { fill: '#333', fontSize: '24px', fontWeight: 'bold' },
              }}
            />

          </div>
        </div>

        <div className="recommendation">
          {has_recommendation ? (
            <div>
              <span>¿Tienes recomendación de hábitos alimenticios?</span>
              <br />
              <button
                className="view-plan-btn"
                onClick={() => navigate('/student/nutrition-plan')}
              >
                Ver plan completo
              </button>
            </div>
          ) : (
            <div>
              <p className="no-recommendation-message">
                No tienes recomendación disponible aún.
              </p>
              <button
                className="start-form-btn"
                onClick={() => navigate('/student/complete-analysis')}
              >
                Generar tu plan
              </button>
            </div>
          )}
        </div>

        {/* Modal de éxito */}
        {showSuccessMessage && (
          <div className="success-message">
            <span>¡Nombre actualizado correctamente!</span>
          </div>
        )}
      </div>

      <footer>
        <p>2025 © Tus datos protegidos con NutriScanU</p>
      </footer>

      {/* Modal de edición de nombre */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-confirm">
            <p>Ingresa tus nuevos nombres:</p>
            
            {/* Mostrar error general si existe */}
            {errors.general && (
              <div className="error-general">
                {errors.general}
              </div>
            )}
            
            <input
              type="text"
              placeholder="Nuevo nombre"
              value={tempFirstName}
              onChange={handleInputChange(setTempFirstName, 'firstName')}
              className={errors.firstName ? 'input-error' : ''}
            />
            {errors.firstName && <span className="error-msg">{errors.firstName}</span>}

            <input
              type="text"
              placeholder="Apellido paterno"
              value={tempLastName}
              onChange={handleInputChange(setTempLastName, 'lastName')}
              className={errors.lastName ? 'input-error' : ''}
            />
            {errors.lastName && <span className="error-msg">{errors.lastName}</span>}

            <input
              type="text"
              placeholder="Apellido materno"
              value={tempMiddleName}
              onChange={handleInputChange(setTempMiddleName, 'middleName')}
              className={errors.middleName ? 'input-error' : ''}
            />
            {errors.middleName && <span className="error-msg">{errors.middleName}</span>}

            

            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleOpenConfirm}>Guardar</button>
              <button className="cancel-btn" onClick={handleCancelEdit}>Volver</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-confirm">
            <p>¿Estás seguro de guardar los nuevos nombres?</p>
            <div className="modal-actions">
              <button 
                className="confirm-btn" 
                onClick={handleConfirmSave}
                disabled={updateLoading}
                style={{ opacity: updateLoading ? 0.6 : 1 }}
              >
                {updateLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="mini-spinner"></div>
                    Guardando...
                  </div>
                ) : (
                  'Sí, continuar'
                )}
              </button>
              <button 
                className="cancel-btn" 
                onClick={handleCancelConfirm}
                disabled={updateLoading}
                style={{ opacity: updateLoading ? 0.6 : 1 }}
              >
                No, revisar otra vez
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
