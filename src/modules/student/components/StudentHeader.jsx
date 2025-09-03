import React from "react";
import { useNavigate } from "react-router-dom";
import "./StudentHeader.css";

const StudentHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="student-header">
      <div className="student-header-container">
        <h2 className="student-logo">NutriScanU</h2>

        <nav className="nav">
          <button onClick={handleLogout} className="logout-button">
            <span style={{ marginRight: '8px' }}>✨</span>
            Cerrar Sesión
          </button>
        </nav>
      </div>
    </header>
  );
};

export default StudentHeader;
