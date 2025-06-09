import React, { useState, useEffect } from 'react';  /* 🔥 Agregamos useEffect */
import { Link } from 'react-router-dom';
import './NutriNavbar.css';

const NutriNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = !menuOpen ? 'hidden' : 'auto';
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  /* 🔥 Nuevo: cerrar el menú automáticamente si el ancho de ventana es grande */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
        document.body.style.overflow = 'auto';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* (todo tu mismo código) */}
      {menuOpen && <div className="nutri-overlay" onClick={closeMenu}></div>}

      <header className="nutri-navbar-wrapper">
        <nav className="nutri-navbar">
          <Link to="/" className="nutri-logo">
            NutriScanU
          </Link>

          <div className={`nutri-menu-toggle ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <ul className="nutri-nav-links">
            {/* <li><Link to="/">Inicio</Link></li> */}
          </ul>

          <Link to="/login" className="nutri-register-now">
            Iniciar Sesión →
          </Link>
        </nav>

        <div className={`nutri-mobile-menu-panel ${menuOpen ? 'open' : ''}`}>
          <div className="nutri-mobile-header">
            <Link to="/" className="nutri-logo" onClick={closeMenu}>NutriScanU</Link>
          </div>

          <div className="nutri-mobile-content">
            <ul className="nutri-mobile-list">
              {/* <li onClick={closeMenu}><Link to="/">Inicio <span className="arrow">➔</span></Link></li> */}
            </ul>

            <div className="nutri-mobile-actions">
              <Link to="/login" className="login-button" onClick={closeMenu}>
                Ingresar
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default NutriNavbar;
