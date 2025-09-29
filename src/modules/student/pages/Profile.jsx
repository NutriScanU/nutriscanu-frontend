
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './Profile.css';

// Capitaliza cada palabra de un string
const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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

  // Validación de los campos de nombre
  const validateFields = () => {
    const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const newErrors = {};

    if (!tempFirstName.trim()) newErrors.firstName = 'Falta llenar este campo.';
    else if (!onlyLetters.test(tempFirstName)) newErrors.firstName = 'Solo se permiten letras.';

    if (!tempMiddleName.trim()) newErrors.middleName = 'Falta llenar este campo.';
    else if (!onlyLetters.test(tempMiddleName)) newErrors.middleName = 'Solo se permiten letras.';

    if (!tempLastName.trim()) newErrors.lastName = 'Falta llenar este campo.';
    else if (!onlyLetters.test(tempLastName)) newErrors.lastName = 'Solo se permiten letras.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para abrir el modal de confirmación
  const handleOpenConfirm = () => {
    if (validateFields()) setShowConfirmModal(true);
  };

  // Función para confirmar el guardado de nuevos datos
  const handleConfirmSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${apiBase}/api/students/update-name`, {
        first_name: capitalizeWords(tempFirstName),
        middle_name: capitalizeWords(tempMiddleName),
        last_name: capitalizeWords(tempLastName)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          first_name: capitalizeWords(tempFirstName),
          middle_name: capitalizeWords(tempMiddleName),
          last_name: capitalizeWords(tempLastName)
        }
      }));

      // Mostrar mensaje de éxito
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000); // Mostrar por 3 segundos

      setShowConfirmModal(false);
      setShowEditModal(false);
    } catch (err) {
      console.error('❌ Error al actualizar nombre:', err);
    }
  };

  // Función para cancelar la edición de nombre
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setErrors({});
  };

  // Función para cancelar la confirmación
  const handleCancelConfirm = () => setShowConfirmModal(false);

  // Función para manejar cambios en los campos de entrada
  const handleInputChange = (setter, fieldName) => (e) => {
    const value = e.target.value;
    setter(value);

    const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Falta llenar este campo.' }));
    } else if (value.trim().length === 1) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Este campo debe tener al menos 2 caracteres' }));
    } else if (!onlyLetters.test(value)) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Solo se permiten letras.' }));
    } else {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
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
          <button className="back-button" onClick={() => navigate("/student/home")}>←</button>
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
        <button className="back-button" onClick={() => navigate("/student/home")}>←</button>
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
              <button className="confirm-btn" onClick={handleConfirmSave}>Sí, continuar</button>
              <button className="cancel-btn" onClick={handleCancelConfirm}>No, revisar otra vez</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
