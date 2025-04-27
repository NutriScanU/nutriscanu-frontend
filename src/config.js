// src/config.js

// Obtenemos las URLs desde las variables de entorno, si no están definidas, usamos valores por defecto
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const BACKEND_FLASK_URL = process.env.REACT_APP_BACKEND_FLASK_URL || 'http://localhost:8000';

export { API_URL, BACKEND_FLASK_URL };
