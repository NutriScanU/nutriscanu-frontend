// src/routes/AppRouter.jsx
import { Routes, Route } from "react-router-dom";

import Home from "../modules/public/pages/Home";

import Login from "../modules/auth/pages/Login";
import Register from "../modules/auth/pages/Register";
import ForgotPassword from "../modules/auth/pages/ForgotPassword";
import ResetPassword from "../modules/auth/pages/ResetPassword";

import AuthLayout from "../layouts/AuthLayout"; // 💥 Nuevo import
import StudentLayout from "../layouts/StudentLayout";

import StudentHome from "../modules/student/pages/StudentHome";
import Profile from "../modules/student/pages/Profile";
import AnalysisStatus from "../modules/student/pages/AnalysisStatus";
import Recommendations from "../modules/student/pages/Recommendations";
import MultiStepForm from "../modules/student/components/MultiStepForm";
import CalendarioNutricional from "../modules/student/pages/CalendarioNutricional"; // Importa tu nuevo componente


import PrivateRoute from "./PrivateRoute";

function AppRouter() {
  return (
    <Routes>
      {/* HOME */}
      <Route path="/" element={<Home />} />

      {/* AUTENTICACIÓN */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* RUTAS PROTEGIDAS PARA ESTUDIANTES */}
      <Route
        path="/student"
        element={
          <PrivateRoute allowedRoles={["estudiante"]}>
            <StudentLayout />
          </PrivateRoute>
        }
      >
        <Route path="home" element={<StudentHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="analysis-status" element={<AnalysisStatus />} />
        {/* <Route path="recommendations" element={<Recommendations />} /> */}
        <Route path="nutrition-plan" element={<CalendarioNutricional />} />
        <Route path="complete-analysis" element={<MultiStepForm />} />
      </Route>

      {/* RUTA NO ENCONTRADA */}
      <Route path="*" element={<h2>Ruta no encontrada</h2>} />
    </Routes>
  );
}

export default AppRouter;
