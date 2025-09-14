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

    fetch("/cod.json")
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

  const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
  const categorias = ["desayuno", "colasion", "almuerzo", "snack", "cena"]; // ✅ Añadido colasion y snack

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
      {/* Vista vertical para móvil */}
      <div className="calendario-nutricional-cards">
        {diasSemana.map((dia) => (
          <div className="calendario-dia-card" key={dia}>
            <h2 className="calendario-dia-titulo">{dia.charAt(0).toUpperCase() + dia.slice(1)}</h2>
            <ul className="calendario-categorias-lista">
              {categorias.map((categoria) => (
                <li className="calendario-categoria-item" key={categoria}>
                  <span className="calendario-categoria-nombre">{categoria.charAt(0).toUpperCase() + categoria.slice(1)}:</span>
                  <span className="calendario-categoria-comida">
                    {menu[dia]?.[categoria]?.split("\n").map((linea, i) => (
                      <span key={i}>{linea}</span>
                    )) || "-"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Vista tabla para desktop */}
      <div className="calendario-nutricional-table-wrapper">
        <table className="calendario-nutricional-table">
          <thead>
            <tr>
              <th></th>
              {diasSemana.map((dia) => (
                <th key={dia}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria}>
                <td className="calendario-nutricional-category">
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </td>
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
    </div>
  );
};

export default CalendarioNutricional;
