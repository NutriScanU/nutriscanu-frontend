import React from 'react';
import { Link } from 'react-router-dom'; // 💥 Importa Link
import './NutriFooter.css';

const NutriFooter = () => {
  return (
    <footer className="nutri-footer-wrapper">
      <div className="nutri-footer">

        {/* Secciones de enlaces */}
        <div className="footer-links">
          <div>
            <h4>Compañía</h4>
            <ul>
              <li><a href="#">Sobre nosotros</a></li>
              <li><a href="#">Contáctanos</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4>Servicios</h4>
            <ul>
              <li><a href="#">Detección de enfermedades</a></li>
              <li><a href="#">Recomendaciones nutricionales</a></li>
              <li><a href="#">Planificación semanal de comidas</a></li>
            </ul>
          </div>

          <div>
            <h4>Recursos</h4>
            <ul>
              <li><a href="#">Guías de alimentación</a></li>
              <li><a href="#">Consejos de estilo de vida</a></li>
              <li><a href="#">Preguntas frecuentes</a></li>
            </ul>
          </div>

          <div>
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Política de privacidad</a></li>
              <li><a href="#">Términos y condiciones</a></li>
            </ul>
          </div>
        </div>

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
            <a href="#"><img src="/icons/facebook.svg" alt="Facebook" /></a>
            <a href="#"><img src="/icons/linkedin.svg" alt="LinkedIn" /></a>
            <a href="#"><img src="/icons/twitter.svg" alt="Twitter" /></a>
            <a href="#"><img src="/icons/instagram.svg" alt="Instagram" /></a>
            <a href="#"><img src="/icons/youtube.svg" alt="YouTube" /></a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default NutriFooter;
