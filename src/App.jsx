import { useLocation } from 'react-router-dom';
import NutriNavbar from './components/Navbar/NutriNavbar';
import NutriFooter from './components/Footer/NutriFooter';
import AppRouter from './routes/AppRouter';
import './App.css';

function App() {
  const location = useLocation();

  // Rutas donde NO quiero que aparezcan el navbar público y footer
  const hiddenRoutes = [
    '/login', 
    '/register', 
    '/forgot-password', 
    '/reset-password',
    '/student'
  ];

  // Si la ruta actual empieza con alguna de las rutas ocultas
  const isHiddenRoute = hiddenRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="app-container">
      {!isHiddenRoute && <NutriNavbar />}

      {/* 🔥 Cambia el main dependiendo la ruta */}
      <main className={isHiddenRoute ? "auth-content" : "app-content"}>
        <AppRouter />
      </main>

      {!isHiddenRoute && <NutriFooter />}
    </div>
  );
}

export default App;
