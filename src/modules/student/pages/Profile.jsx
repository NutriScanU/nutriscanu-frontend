// src/modules/student/pages/Profile.jsx
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
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const apiBase = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiBase}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        setProfileData(res.data);
      } catch (err) {
        console.error('❌ Error al obtener perfil:', err);
        setError('No se pudo cargar el perfil. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [apiBase]);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

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

      const updatedUrl = `${apiBase}${res.data.profile_image}`;

      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          profile_image: updatedUrl
        }
      }));
    } catch (err) {
      console.error('❌ Error al subir imagen:', err);
    }
  };

  const handleEditName = () => {
    setIsEditing(true);
    setNewName(profileData.profile.first_name);
  };

  const handleSaveName = () => {
    setIsEditing(false);
    setProfileData({
      ...profileData,
      profile: { ...profileData.profile, first_name: newName },
    });
  };

  if (loading) return <div className="loading">Cargando perfil...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profileData) return <div className="error">No se pudo cargar el perfil.</div>;

  const { profile, health_condition, probability, has_recommendation } = profileData;
  const fullName = `${profile?.first_name || ''} ${profile?.middle_name || ''} ${profile?.last_name || ''}`;
  const profileImage = profile?.profile_image || '/images/Student/Profile/default-profile.png';

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
            onClick={handleImageClick}
            onError={(e) => {
              e.target.src = '/images/Student/Profile/default-profile.png';
            }}
          />
          <button className="edit-image-button" onClick={handleImageClick}>
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
          {!isEditing ? (
            <>
              <h3>{fullName}</h3>
              <button className="edit-name-btn" onClick={handleEditName}>Editar nombre</button>
            </>
          ) : (
            <div className="edit-name-input">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nuevo nombre"
              />
              <button onClick={handleSaveName}>Guardar</button>
            </div>
          )}
        </div>

        <div className="profile-health">
          <div className="health-info">
            <span className="health-status">Diagnóstico: {health_condition || 'No disponible'}</span>
            <span className="health-status">
              Probabilidad: {probability !== undefined && probability !== null ? `${probability}%` : 'No disponible'}
            </span>
          </div>

          <div className="health-meter">
            <CircularProgressbar
              value={typeof probability === 'number' ? probability : 0}
              text={`${typeof probability === 'number' ? probability : 0}%`}
              strokeWidth={10}
              styles={{
                path: { stroke: `#007BFF`, strokeLinecap: 'round' },
                trail: { stroke: '#e6e6e6' },
                text: { fill: '#333', fontSize: '24px', fontWeight: 'bold' },
              }}
            />
          </div>
        </div>

        <div className="recommendation">
          {has_recommendation ? (
            <>
              <span>¿Tienes recomendación de hábitos alimenticios? Sí</span>
              <button className="view-plan-btn" onClick={() => setIsPlanVisible(!isPlanVisible)}>
                {isPlanVisible ? "Ver menos" : "Ver plan completo"}
              </button>
            </>
          ) : (
            <>
              <p className="no-recommendation-message">No tienes recomendación disponible aún.</p>
              <button className="start-form-btn" onClick={() => navigate('/student/complete-analysis')}>
                Realizar formulario para obtener tu plan
              </button>
            </>
          )}
        </div>

        {isPlanVisible && has_recommendation && (
          <div className="complete-plan">
            <p>Este es el plan completo de hábitos alimenticios...</p>
          </div>
        )}
      </div>

      <footer>
        <p>2025 © Tus datos protegidos con NutriScanU</p>
      </footer>
    </div>
  );
};

export default Profile;
