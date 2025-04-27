import { useLocation } from 'react-router-dom';
import NutriNavbar from './components/Navbar/NutriNavbar';
import NutriFooter from './components/Footer/NutriFooter';
import AppRouter from './routes/AppRouter';
import './App.css';

function App() {
  const location = useLocation();

  // Definimos rutas donde no debe aparecer navbar/footer
  const hideNavbarRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/student'];

  // Si la ruta empieza por alguno de esos paths
  const shouldHideNavbar = hideNavbarRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="app-container">
      {!shouldHideNavbar && <NutriNavbar />}

      <main className={shouldHideNavbar ? "auth-content" : "app-content"}>
        <AppRouter />
      </main>

      {!shouldHideNavbar && <NutriFooter />}
    </div>
  );
}

export default App;
