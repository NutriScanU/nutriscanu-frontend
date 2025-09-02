import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentHeader from "../components/StudentHeader";
import "../../../styles/studentPanel.css";

const API_URL = process.env.REACT_APP_API_URL;

function StudentHome() {
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/students/recommendations`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // No lanzamos error si no tiene recomendaciones (usuario nuevo)
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendation(data.recommendations[0]);
        }

      } catch (err) {
        console.error("❌ Error al cargar recomendación:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [navigate]);

  const handleClickPlanAlimentacion = () => {
    if (!recommendation) {
      alert("Debes registrar tu análisis clínico primero.");
      return;
    }

    localStorage.setItem('categoriaNutricional', recommendation);
    navigate('/student/nutrition-plan');
  };

  if (loading) {
    return <div className="loading">Cargando tu información...</div>;
  }

  return (
    <div className="student-home">
      <StudentHeader />

      <h1 className="student-home-title">Bienvenido a tu panel, estudiante 👋</h1>
      <p className="student-home-sub">Aquí puedes revisar tu análisis y recomendaciones personalizadas.</p>

      <div className="student-home-cards">
        {/* Botón registrar análisis (siempre disponible) */}
        <div className="student-card analysis-card" onClick={() => navigate('/student/complete-analysis')}>
          <h2>📝 Registrar análisis</h2>
          <p>Completa tu análisis clínico y hábitos alimentarios para obtener recomendaciones personalizadas y precisas.</p>
        </div>

        {/* Botón ver plan (disponible sólo si tiene recomendación) */}
        <div
          className={`student-card nutrition-plan-card ${!recommendation ? 'disabled' : ''}`}
          onClick={handleClickPlanAlimentacion}
          style={{ 
            cursor: recommendation ? "pointer" : "not-allowed"
          }}
        >
          <h2>🥗 Ver plan de alimentación</h2>
          <p>Consulta tus recomendaciones alimenticias personalizadas según tu condición actual y objetivos nutricionales.</p>
          {!recommendation && (
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '2rem',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              fontStyle: 'italic',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              * Completa tu análisis primero
            </div>
          )}
        </div>

        {/* Botón perfil */}
        <div className="student-card profile-card" onClick={() => navigate('/student/profile')}>
          <h2>👤 Perfil</h2>
          <p>Consulta, edita y actualiza tu información personal, datos médicos y preferencias nutricionales.</p>
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
