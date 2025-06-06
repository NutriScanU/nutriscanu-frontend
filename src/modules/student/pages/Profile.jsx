// src/modules/student/pages/Profile.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        setProfileData(res.data);
      } catch (err) {
        console.error('❌ Error al obtener perfil:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/students/update-photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      // Actualizar foto tras éxito
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

  if (loading) return <div className="loading">Cargando perfil...</div>;
  if (!profileData) return <div className="error">No se pudo cargar el perfil.</div>;

  const { profile } = profileData;
  const fullName = `${profile?.first_name || ''} ${profile?.middle_name || ''} ${profile?.last_name || ''}`;
  const profileImage = profile?.profile_image || 'https://via.placeholder.com/150';

  return (
    <div className="profile-container">
      <div className="profile-image-wrapper">
        <img src={profileImage} alt="Foto de perfil" className="profile-image" />
        <button onClick={handleImageClick} className="edit-image-button">
          <img src="/icons/edit-pencil.svg" alt="Editar" />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </div>
      <h2 className="full-name">{fullName}</h2>
    </div>
  );
};

export default Profile;
