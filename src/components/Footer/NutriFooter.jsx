import React from 'react';
import { Link } from 'react-router-dom'; // 💥 Importa Link
import './NutriFooter.css';

const NutriFooter = () => {
  return (
    <footer className="nutri-footer-wrapper">
      <div className="nutri-footer">

        {/* Divider */}
        <hr className="footer-divider" />

        {/* Branding + Redes sociales */}
        <div className="footer-bottom">
          <div className="footer-branding">
            {/* 🔥 Cambiamos el <h2> por un <Link> */}
            <Link to="/" className="footer-logo-text">NutriScanU</Link>
            <p>© 2025 NutriScanU. Todos los derechos reservados.</p>
          </div>

          <div className="footer-socials">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
              <img src="/icons/facebook.svg" alt="Facebook" />
            </a>
            <a href="https://www.linkedin.com/in/" target="_blank" rel="noopener noreferrer">
              <img src="/icons/linkedin.svg" alt="LinkedIn" />
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
              <img src="/icons/twitter.svg" alt="Twitter" />
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
              <img src="/icons/instagram.svg" alt="Instagram" />
            </a>
            <a href="https://www.youtube.com/channel/" target="_blank" rel="noopener noreferrer">
              <img src="/icons/youtube.svg" alt="YouTube" />
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default NutriFooter;
