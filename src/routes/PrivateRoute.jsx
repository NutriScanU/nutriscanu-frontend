import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (allowedRoles.includes(decoded.role)) {
      return children;
    } else {
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error("Token inválido o expirado", error);
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
