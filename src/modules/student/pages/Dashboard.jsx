import React from "react";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      <h1>Bienvenido al panel del estudiante 🎓</h1>
      <p>Hola {user?.first_name}, aquí podrás gestionar tu información.</p>
    </div>
  );
}

export default Dashboard;