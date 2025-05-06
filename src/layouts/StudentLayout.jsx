import React from "react";
import { Outlet } from "react-router-dom";
import "../styles/studentPanel.css";

function StudentLayout() {
  return (
    <div className="student-content-full">
      <Outlet />
    </div>
  );
}

export default StudentLayout;
