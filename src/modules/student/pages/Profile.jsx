import React, { useState, useEffect } from "react";
import "./Profile.css"; // Asegúrate de tener estilos para la alerta

function Perfil() {
  const [usuario, setUsuario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    tieneAnemia: false, // Nuevo campo para anemia
  });

  useEffect(() => {
    // Simular carga de datos (en la realidad lo traerías de backend o estado global)
    const datosCargados = {
      nombre: "Juan Pérez",
      correo: "juan.perez@example.com",
      telefono: "987654321",
      tieneAnemia: true,  // Por ejemplo, resultado del análisis
    };
    setUsuario(datosCargados);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = () => {
    console.log("Datos guardados:", usuario);
    alert("Datos guardados correctamente!");
  };

  return (
    <div>
      <h2>Perfil del estudiante</h2>
      <p>Aquí podrás actualizar tus datos personales.</p>

      {/* Mostrar alerta o mensaje si tiene anemia */}
      {usuario.tieneAnemia && (
        <div className="alerta-anemia">
          ⚠️ Atención: Se detectó que tienes anemia. Puedes revisar tu plan de recomendacion de habitos alientnicios y consultar también con su especialista.
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleGuardar(); }}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={usuario.nombre}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Correo:</label>
          <input
            type="email"
            name="correo"
            value={usuario.correo}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Teléfono:</label>
          <input
            type="tel"
            name="telefono"
            value={usuario.telefono}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}

export default Perfil;
