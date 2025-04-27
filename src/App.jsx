import { useLocation } from 'react-router-dom';
import NutriNavbar from './components/Navbar/NutriNavbar';
import NutriFooter from './components/Footer/NutriFooter';
import AppRouter from './routes/AppRouter';
import './App.css';

function App() {
  const location = useLocation();

  // Definimos rutas de autenticación
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="app-container">
      {!isAuthRoute && <NutriNavbar />}

      {/* 🔥 Cambiamos la clase del <main> según la ruta */}
      <main className={isAuthRoute ? "auth-content" : "app-content"}>
        <AppRouter />
      </main>

      {!isAuthRoute && <NutriFooter />}
    </div>
  );
}

export default App;
