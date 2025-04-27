import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 💥 Importa BrowserRouter
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 🔥 Aquí envolvemos toda la app */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
