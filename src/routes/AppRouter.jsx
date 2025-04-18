import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import StudentLayout from "../layouts/StudentLayout";

import StudentHome from "../pages/student/StudentHome";
import Profile from "../pages/student/Profile";
import AnalysisStatus from "../pages/student/AnalysisStatus";
import Recommendations from "../pages/student/Recommendations";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Estudiante */}
        <Route path="/student" element={<StudentLayout />}>
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
