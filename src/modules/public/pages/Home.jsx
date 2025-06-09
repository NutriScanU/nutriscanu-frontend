// src/modules/public/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">

      {/* HERO animado */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h1>Bienvenido a <span>NutriScanU</span></h1>
          <p>
            Una plataforma que combina inteligencia artificial y salud para guiarte
            hacia una alimentación equilibrada y personalizada según tus análisis clínicos.
          </p>
          <button className="cta-button" onClick={() => navigate('/register')}>
            Empezar ahora →
          </button>
        </motion.div>

        <motion.div
          className="hero-image"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        />
      </section>

      {/* ¿Cómo funciona? */}
      <motion.section
        className="how-it-works"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2>¿Cómo funciona?</h2>
        <div className="steps">
          <motion.div className="step" whileHover={{ scale: 1.05 }}>
            <img src="https://img.icons8.com/ios-filled/100/4caf50/test-tube.png" alt="Clínico" />
            <p>Ingresa tus datos clínicos (edad, hemoglobina, glucosa...)</p>
          </motion.div>
          <motion.div className="step" whileHover={{ scale: 1.05 }}>
            <img src="https://cdn-icons-png.flaticon.com/512/706/706164.png" alt="Alimentación saludable" />
            <p>Responde preguntas sobre tu alimentación y estilo de vida</p>
          </motion.div>
          <motion.div className="step" whileHover={{ scale: 1.05 }}>
            <img src="https://img.icons8.com/ios-filled/100/ab47bc/brain.png" alt="Diagnóstico" />
            <p>Recibe un diagnóstico con un plan semanal adaptado a ti</p>
          </motion.div>
        </div>
      </motion.section>

      {/* ¿Por qué elegirnos? */}
      <motion.section
        className="why-nutriscan"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2>¿Por qué elegir NutriScanU?</h2>
        <p>
          Porque creemos en democratizar la nutrición personalizada. Usamos inteligencia artificial
          para que cada estudiante tenga acceso gratuito a un diagnóstico útil y una guía alimentaria semanal.
        </p>
      </motion.section>
    </div>
  );
};

export default Home;
