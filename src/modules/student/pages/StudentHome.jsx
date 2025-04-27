import React from "react";
import StudentHeader from "../components/StudentHeader";
import "../../../styles/studentPanel.css";

function StudentHome() {
  return (
    <div className="student-home">
      <StudentHeader />

      <h1 className="student-home-title">Bienvenido a tu panel, estudiante 👋</h1>
      <p className="student-home-sub">Aquí puedes revisar tu análisis y recomendaciones personalizadas.</p>

      <div className="student-home-cards">
        {/* 🔁 Nuevo flujo de registro multistep */}
        <div className="student-card" onClick={() => window.location.href='/student/complete-analysis'}>
          <h2>📝 Registrar análisis</h2>
          <p>Completa tu análisis clínico y hábitos para obtener recomendaciones.</p>
        </div>

        {/* 🔎 Visualizar plan de hábitos previamente generado */}
        <div className="student-card" onClick={() => window.location.href='/student/PlanNutrition'}>
          <h2>🥗 Ver plan de alimentación</h2>
          <p>Consulta tus recomendaciones alimenticias según tu condición actual.</p>
        </div>

        {/* 👤 Mantiene perfil */}
        <div className="student-card" onClick={() => window.location.href='/student/profile'}>
          <h2>👤 Perfil</h2>
          <p>Consulta o edita tu información personal registrada.</p>
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
