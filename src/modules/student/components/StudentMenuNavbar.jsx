import React from "react";
import { Link } from "react-router-dom";
import './StudentMenuNavbar.css';

function StudentMenuNavbar({ user, onLogout }) {
  return (
    <div className="menu-container">
      <div className="menu">
        <h2>Menú</h2>
        <ul>
          <li><Link to="/student/profile">👤 Ver perfil</Link></li>
          <li><Link to="/student/analysis-status">📊 Estado de análisis</Link></li>
          <li><Link to="/student/recommendations">🍽️ Mis recomendaciones</Link></li>
          <li><button onClick={onLogout}>🚪 Cerrar sesión</button></li>
        </ul>
      </div>
    </div>
  );
}

export default StudentMenuNavbar;
