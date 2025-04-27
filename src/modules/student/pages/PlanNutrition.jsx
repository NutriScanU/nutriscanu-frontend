import React from 'react';
import { useNavigate } from 'react-router-dom'; // 💥 Importante para navegar
import './PlanNutrition.css';

const PlanNutrition = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // 🔥 Regresa a la página anterior (no fija a /student/home)
  };

  return (
    <div className="plan-nutrition-container">
      {/* Flecha de retroceso */}
      <button className="back-button" onClick={handleGoBack}>
        ←
      </button>

      <div className="plan-nutrition-table-container">
        <h2>Plan Semanal de Alimentación Saludable</h2>
        <p className="plan-nutrition-description">
          Este es un ejemplo de plan de alimentación balanceado, recomendado para mejorar tus hábitos nutricionales.
          Consulta siempre con un especialista para personalizar tu dieta según tus necesidades.
        </p>

        <table className="plan-nutrition-table">
          <thead>
            <tr>
              <th>Día</th>
              <th>Desayuno</th>
              <th>Almuerzo</th>
              <th>Cena</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Lunes</td>
              <td>Avena con frutas</td>
              <td>Pollo a la plancha con ensalada</td>
              <td>Sopa de verduras</td>
            </tr>
            <tr>
              <td>Martes</td>
              <td>Huevos revueltos con tostadas</td>
              <td>Sándwich de pavo con verduras</td>
              <td>Pescado al vapor con brócoli</td>
            </tr>
            <tr>
              <td>Miércoles</td>
              <td>Yogur griego con frutos rojos</td>
              <td>Ensalada de pollo y quinua</td>
              <td>Sopa de tomate con pan integral</td>
            </tr>
            <tr>
              <td>Jueves</td>
              <td>Batido de frutas con nueces</td>
              <td>Salmón a la plancha con espárragos</td>
              <td>Salteado de verduras</td>
            </tr>
            <tr>
              <td>Viernes</td>
              <td>Cereal integral con leche</td>
              <td>Wrap de vegetales</td>
              <td>Tofu a la parrilla con verduras</td>
            </tr>
            <tr>
              <td>Sábado</td>
              <td>Panqueques con miel</td>
              <td>Ensalada de pollo</td>
              <td>Estofado de carne</td>
            </tr>
            <tr>
              <td>Domingo</td>
              <td>Pan tostado con palta</td>
              <td>Paella de mariscos</td>
              <td>Sopa de pollo</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanNutrition;
