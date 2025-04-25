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
        <div className="student-card" onClick={() => window.location.href='/student/analysis-status'}>
          <h2>📊 Ver análisis</h2>
          <p>Consulta tu estado de salud según el último análisis.</p>
        </div>

        <div className="student-card" onClick={() => window.location.href='/student/recommendations'}>
          <h2>🥗 Recomendaciones</h2>
          <p>Accede a consejos personalizados según tu condición.</p>
        </div>

        <div className="student-card" onClick={() => window.location.href='/student/profile'}>
          <h2>👤 Perfil</h2>
          <p>Consulta o edita tu información personal registrada.</p>
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
