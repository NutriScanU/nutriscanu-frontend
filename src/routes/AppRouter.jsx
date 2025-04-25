import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../modules/auth/pages/Login";
import Register from "../modules/auth/pages/Register";
import ForgotPassword from "../modules/auth/pages/ForgotPassword";
import ResetPassword from "../modules/auth/pages/ResetPassword";

import StudentLayout from "../layouts/StudentLayout";

import StudentHome from "../modules/student/pages/StudentHome";
import Profile from "../modules/student/pages/Profile";
import AnalysisStatus from "../modules/student/pages/AnalysisStatus";
import Recommendations from "../modules/student/pages/Recommendations";

import PrivateRoute from "./PrivateRoute";


function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Rutas protegidas para estudiantes */}
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
          <Route path="recommendations" element={<Recommendations />} />
        </Route>

        <Route path="*" element={<h2>Ruta no encontrada</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
