import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localProbability, setLocalProbability] = useState(0);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [tempFirstName, setTempFirstName] = useState('');
  const [tempMiddleName, setTempMiddleName] = useState('');
  const [tempLastName, setTempLastName] = useState('');
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const apiBase = process.env.REACT_APP_API_URL;
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
          setLocalProbability(0);  // Comienza en 0
          let increment = 1;
          const targetProbability = res.data.probability;
          const interval = setInterval(() => {
            setLocalProbability(prev => {
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
        console.error('❌ Error al obtener perfil:', err);
        setError('No se pudo cargar el perfil. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [apiBase]);

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${apiBase}/api/students/update-photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          profile_image: res.data.profile_image
        }
      }));
    } catch (err) {
      console.error('❌ Error al subir imagen:', err);
    }
  };

  const handleEditName = () => {
    setTempFirstName('');
    setTempMiddleName('');
    setTempLastName('');
    setErrors({});
    setShowEditModal(true);
  };

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

  const handleOpenConfirm = () => {
    if (validateFields()) setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${apiBase}/api/students/update-name`, {
        first_name: tempFirstName,
        middle_name: tempMiddleName,
        last_name: tempLastName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          first_name: tempFirstName,
          middle_name: tempMiddleName,
          last_name: tempLastName
        }
      }));

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000); // Mostrar por 3 segundos

      setShowConfirmModal(false);
      setShowEditModal(false);
    } catch (err) {
      console.error('❌ Error al actualizar nombre:', err);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setErrors({});
  };

  const handleCancelConfirm = () => setShowConfirmModal(false);

  const handleInputChange = (setter, fieldName) => (e) => {
    const value = e.target.value;
    setter(value);

    const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Falta llenar este campo.' }));
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

  if (loading) return <div className="loading">Cargando perfil...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profileData) return <div className="error">No se pudo cargar el perfil.</div>;

  const { profile, health_condition, probability, has_recommendation } = profileData;
  const fullName = `${profile?.first_name || ''} ${profile?.middle_name || ''} ${profile?.last_name || ''}`;
  const profileImage = profile?.profile_image
    ? `${apiBase}${profile.profile_image}`
    : '/images/Student/Profile/default-profile.png';

  const getColorByCondition = () => {
    if (health_condition === 'Diabetes') return '#FF5733'; // Color para Diabetes
    if (health_condition === 'Anemia') return '#FF9F00'; // Color para Anemia
    if (health_condition === 'Ambos') return '#5C6BC0'; // Color para Ambas
    return '#4CAF50'; // Color para Sano
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate("/student/home")}>←</button>
        <h2>PERFIL</h2>
      </div>

      <div className="profile-content">
        <div className="profile-image-wrapper">
          <img
            src={profileImage}
            alt="Foto de perfil"
            className="profile-image"
            /* onClick={handleImageClick}*/
            onError={(e) => {
              e.target.src = '/images/Student/Profile/default-profile.png';
            }}
          />

          <button className="edit-image-button" /*onClick={handleImageClick}*/>
            <img src="/images/Student/Profile/icon-edit.png" alt="Editar" />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
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
              value={localProbability}
              text={`${localProbability}%`}
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


        {isPlanVisible && has_recommendation && (
          <div className="complete-plan">
            <p>Este es el plan completo de hábitos alimenticios...</p>
          </div>
        )}

        {showSuccessMessage && (
          <div className="success-message">
            <span>¡Nombre actualizado correctamente!</span>
          </div>
        )}
      </div>

      <footer>
        <p>2025 © Tus datos protegidos con NutriScanU</p>
      </footer>

      {/* Modal de edición */}
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
              value={tempMiddleName}
              onChange={handleInputChange(setTempMiddleName, 'middleName')}
              className={errors.middleName ? 'input-error' : ''}
            />
            {errors.middleName && <span className="error-msg">{errors.middleName}</span>}

            <input
              type="text"
              placeholder="Apellido materno"
              value={tempLastName}
              onChange={handleInputChange(setTempLastName, 'lastName')}
              className={errors.lastName ? 'input-error' : ''}
            />
            {errors.lastName && <span className="error-msg">{errors.lastName}</span>}

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
