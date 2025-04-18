import React from "react";
import { Outlet } from "react-router-dom";
import StudentMenuNavbar from "../components/student/StudentMenuNavbar";

function StudentLayout() {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div style={{ display: "flex" }}>
      <StudentMenuNavbar user={user} onLogout={handleLogout} />
      <div style={{ padding: "2rem", flexGrow: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}

export default StudentLayout;
