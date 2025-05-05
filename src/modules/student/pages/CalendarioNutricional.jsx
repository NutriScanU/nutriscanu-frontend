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

    fetch("/cod.json")  // Asegúrate de que la ruta sea correcta
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

  const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];  // Cambié a minúsculas
  const categorias = ["desayuno", "almuerzo", "cena"];  // Cambié a minúsculas

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
              <th key={dia}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</th>  // Capitaliza la primera letra para mostrar correctamente
            ))}
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria}>
              <td className="calendario-nutricional-category">{categoria.charAt(0).toUpperCase() + categoria.slice(1)}</td>  {/* Capitaliza la primera letra de la categoría */}
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
