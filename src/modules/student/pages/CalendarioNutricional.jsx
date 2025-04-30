import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/CalendarioNutricional.css";

const CalendarioNutricional = () => {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const categoria = localStorage.getItem("categoriaNutricional");
    if (!categoria) {
      setError("No se encontró categoría nutricional.");
      return;
    }

    fetch("/categorias.json")
      .then((res) => res.json())
      .then((data) => {
        if (data[categoria]) {
          setMenu(data[categoria]);
        } else {
          setError("No existe un menú para esta categoría.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar el menú.");
      });
  }, []);

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const categorias = ["Desayuno", "Almuerzo", "Cena"];

  if (error) {
    return (
      <div className="calendario-nutricional-wrapper">
        <h2 style={{ color: "red" }}>{error}</h2>
        <button onClick={() => navigate("/student/home")} className="btn-regresar">Volver al inicio</button>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="calendario-nutricional-wrapper">
        <p>Cargando plan de alimentación...</p>
      </div>
    );
  }

  return (
    <div className="calendario-nutricional-wrapper">
      <button className="btn-regresar" onClick={() => navigate("/student/home")}>← Volver</button>

      <h1 className="calendario-nutricional-title">Plan Semanal de Comidas 🥗</h1>

      <table className="calendario-nutricional-table">
        <thead>
          <tr>
            <th></th>
            {diasSemana.map((dia) => (
              <th key={dia}>{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria}>
              <td className="calendario-nutricional-category">{categoria}</td>
              {diasSemana.map((dia) => (
                <td key={`${dia}-${categoria}`}>
                  {menu[dia]?.[categoria]?.split("\n").map((linea, i) => (
                    <div key={i}>{linea}</div>
                  )) || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarioNutricional;
