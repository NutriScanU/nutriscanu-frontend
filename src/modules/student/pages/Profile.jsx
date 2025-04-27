import React from "react";
import { useNavigate } from "react-router-dom"; // 💥 Importamos navigate

function Perfil() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // 🔥 Retrocede a la página anterior
  };

  return (
    <div className="perfil-page">
      {/* Flecha para volver */}
      <button className="back-button" onClick={handleGoBack}>
        ←
      </button>

      <h2>Perfil del Estudiante</h2>
      <p>Aquí podrás actualizar tus datos personales.</p>
    </div>
  );
}

export default Perfil;
