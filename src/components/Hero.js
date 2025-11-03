
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button } from 'react-bootstrap';
import './Hero.css';
import icon3d from '../assets/images/3d-icon.png';
import pfpIcon from '../assets/images/PFP.png'; // Yeni ikonu import et
import heroBg from '../assets/images/heroBG.png'; // Arka plan görseli

import startIcon from '../assets/game/start.png';
import GameModal from './GameModal';

const Hero = ({ onOpenMemeGenerator, onOpenPFPGenerator }) => { // Yeni prop'u ekle
  const { t } = useTranslation();
  const [isGameModalOpen, setGameModalOpen] = useState(false);

  return (
    <div className="hero-section">
      <img src={heroBg} alt="" className="hero-bg" loading="lazy" />
      <Container className="h-100 d-flex flex-column justify-content-center align-items-center text-center text-white hero-content">
        <div>
          <h1 className="hero-slogan display-4 fw-bold">{t('hero.slogan')}</h1>
          <p className="lead fs-4 text-white-75 fw-light">{t('hero.subtitle')}</p>
          <Button variant="danger" size="lg" className="mt-4 hero-btn">{t('hero.buy_button')}</Button>
        </div>
      </Container>
      <img 
        src={icon3d} 
        alt="Meme Generator" 
        className="pfp-editor-icon"
        onClick={onOpenMemeGenerator}
        loading="lazy"
      />
      <img 
        src={pfpIcon} 
        alt="PFP Generator" 
        className="pfp-generator-icon" // Yeni bir class adı verelim
        onClick={onOpenPFPGenerator} // Yeni fonksiyonu bağla
        loading="lazy"
      />

      <img
        src={startIcon}
        alt="Start Game"
        className="game-start-icon"
        onClick={() => setGameModalOpen(true)}
        loading="lazy"
      />
      <GameModal isOpen={isGameModalOpen} onClose={() => setGameModalOpen(false)} />
    </div>
  );
};

export default Hero;
