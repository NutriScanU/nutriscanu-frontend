import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const showConsoleWarnings = () => {
  const styles = {
    warning: 'color: #ff4757; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
    brand: 'color: #d4af37; font-size: 20px; font-weight: bold;',
    info: 'color: #2f3542; font-size: 14px; line-height: 1.5;',
    highlight: 'color: #ff6b6b; font-size: 16px; font-weight: bold;'
  };

  console.clear();
  
  console.log('%c⚠️ ¡ALTO! ¡DETENTE!', styles.warning);
  console.log('%cNutriScanU', styles.brand);
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d4af37;');
  
  console.log('%c🚨 ADVERTENCIA DE SEGURIDAD:', styles.highlight);
  console.log('%cEsta es una función para desarrolladores. Si alguien te dijo que pegaras algo aquí para "hackear" una cuenta o "habilitar una función", es una estafa y están tratando de acceder a tu cuenta de NutriScanU.', styles.info);
  
  console.log('%c🔒 PROTEGE TU INFORMACIÓN:', styles.highlight);
  console.log('%c• NUNCA pegues código que no entiendas\n• NUNCA compartas tu información de login\n• NUNCA ejecutes comandos de extraños', styles.info);
  
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d4af37;');
  console.log('%c© 2025 NutriScanU - Todos los derechos reservados', 'color: #666; font-size: 12px;');
};

if (typeof window !== 'undefined') {
  showConsoleWarnings();
  
  const originalClear = console.clear;
  console.clear = function() {
    originalClear.apply(console, arguments);
    setTimeout(showConsoleWarnings, 100);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
