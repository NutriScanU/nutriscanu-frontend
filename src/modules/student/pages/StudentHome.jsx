import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentHeader from "../components/StudentHeader";
import "../../../styles/luxuryStudentPanel.css";

const API_URL = process.env.REACT_APP_API_URL;

function StudentHome() {
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const getUserDisplayName = (userData) => {
    if (!userData) return 'Usuario';
    
    const user = userData.profile || userData;
    
    if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1).toLowerCase();
    }
    
    if (user.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return 'Usuario';
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const profileResponse = await fetch(`${API_URL}/api/students/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUser(profileData);
        }
      } catch (error) {
        console.error("Error al obtener perfil actualizado:", error);
      }
    };

    const fetchRecommendation = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/students/recommendations`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        if (data.recommendations && data.recommendations.length > 0) {
          const rec = data.recommendations[0];
          
          if (rec && rec.trim().length > 0) {
            setRecommendation(rec);
          }
        }
      } catch (err) {
        console.error("Error al cargar recomendación:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchRecommendation();
  }, [navigate]);

  const showLuxuryNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    const wordCount = message.split(' ').length;
    const calculatedTime = Math.max(3000, Math.min(12000, wordCount * 875));
    setTimeout(() => setShowNotification(false), calculatedTime);
  };

  const handleClickPlanAlimentacion = () => {
    if (isNavigating) return;
    if (!recommendation) {
      showLuxuryNotification("Para acceder a tu plan personalizado, primero necesitas completar tu análisis integral. ¡Es rápido y fácil!");
      return;
    }
    setIsNavigating(true);
    localStorage.setItem('categoriaNutricional', recommendation);
    navigate('/student/nutrition-plan');
  };

  const handleClickAnalysis = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    if (recommendation) {
      showLuxuryNotification("Ya tienes análisis registrado. Actualizando datos...");
    }
    setTimeout(() => {
      navigate('/student/complete-analysis');
    }, recommendation ? 1500 : 0);
  };

  const handleClickProfile = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    showLuxuryNotification("Abriendo tu perfil...");
    setTimeout(() => navigate('/student/profile'), 800);
  };

  if (loading) {
    return (
      <div className="luxury-loading">
        <div className="loading-spinner"></div>
        <p>Preparando tu experiencia personalizada...</p>
      </div>
    );
  }

  return (
    <div className="luxury-student-panel">
      <StudentHeader />
      
      {showNotification && (
        <div className="luxury-notification luxury-notification-show">
          <div className="luxury-notification-content">
            <div className="luxury-notification-icon">✨</div>
            <span className="luxury-notification-message">{notificationMessage}</span>
          </div>
        </div>
      )}

      <div className="luxury-header">
        <div className="luxury-header-content">
          <div className="luxury-greeting">
            <h1 className="luxury-title">¡Hola, {getUserDisplayName(user)}! 👋</h1>
            <p className="luxury-subtitle">Tu centro de control nutricional personalizado con inteligencia artificial</p>
          </div>
        </div>
      </div>



      <div className="luxury-cards-section">
        <div className="luxury-cards-container">
          <div className={`luxury-card luxury-card-primary ${isNavigating ? 'luxury-card-disabled' : ''}`} onClick={handleClickAnalysis}>
            <div className="luxury-card-header">
              <div className="luxury-card-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="luxury-card-badge">{recommendation ? 'Actualizar' : 'Esencial'}</div>
            </div>
            <div className="luxury-card-content">
              <h3>Análisis Integral</h3>
              <p>Algoritmos de machine learning analizan tu perfil biológico y hábitos para crear recomendaciones precisas y personalizadas.</p>
            </div>
            <div className="luxury-card-footer">
              <span className="luxury-card-action">{recommendation ? 'Actualizar Análisis' : 'Comenzar Análisis'}</span>
              <div className="luxury-arrow">→</div>
            </div>
          </div>

          <div className={`luxury-card luxury-card-secondary ${!recommendation ? 'luxury-card-disabled' : ''} ${isNavigating ? 'luxury-card-disabled' : ''}`} onClick={handleClickPlanAlimentacion}>
            <div className="luxury-card-header">
              <div className="luxury-card-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {recommendation && <div className="luxury-card-badge luxury-badge-success">Disponible</div>}
              {!recommendation && <div className="luxury-card-badge luxury-badge-pending">Bloqueado</div>}
            </div>
            <div className="luxury-card-content">
              <h3>Plan Nutricional</h3>
              <p>Accede a tu plan de alimentación personalizado, diseñado específicamente para tus objetivos y condiciones de salud.</p>
            </div>
            <div className="luxury-card-footer">
              <span className="luxury-card-action">{recommendation ? 'Ver Mi Plan' : 'Requiere Análisis'}</span>
              <div className="luxury-arrow">→</div>
            </div>
            {!recommendation && (
              <div className="luxury-card-overlay">
                <div className="luxury-lock-content">
                  <div className="luxury-lock-icon">🔒</div>
                  <p className="luxury-lock-text">Completa tu análisis primero</p>
                </div>
              </div>
            )}
          </div>

          <div className={`luxury-card luxury-card-tertiary ${isNavigating ? 'luxury-card-disabled' : ''}`} onClick={handleClickProfile}>
            <div className="luxury-card-header">
              <div className="luxury-card-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div className="luxury-card-content">
              <h3>Perfil Personal</h3>
              <p>Gestiona tu información personal, preferencias alimentarias y datos médicos de forma segura y privada.</p>
            </div>
            <div className="luxury-card-footer">
              <span className="luxury-card-action">Gestionar Perfil</span>
              <div className="luxury-arrow">→</div>
            </div>
          </div>
        </div>
      </div>

      <div className="luxury-footer">
        <div className="luxury-footer-content">
          <div className="luxury-ai-badge">
            <div className="ai-icon">🤖</div>
            <span>Potenciado por IA</span>
          </div>
          <p className="luxury-footer-text">
            Sistema de análisis nutricional avanzado con tecnología de machine learning
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
