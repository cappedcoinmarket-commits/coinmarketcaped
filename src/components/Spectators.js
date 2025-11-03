
import React from 'react';
import './Spectators.css';

const Spectators = ({ spectators, blackHole, isPaused }) => {
  return (
    <div className={`spectators-container ${isPaused ? 'paused' : ''}`}>
      {spectators.map(spectator => {
        const transitionStyle = spectator.isBeingSucked
          ? 'opacity 0.5s, transform 0.5s' // Animate flip/fade, but not position
          : 'left 1s, top 1s, opacity 1s, transform 1s'; // Original transition

        return (
          <div 
            key={spectator.id} 
            className={`spectator-flipper`}
            style={{ 
              left: `${spectator.x}px`, 
              top: `${spectator.y}px`,
              transform: `rotateY(${spectator.isFront ? '0deg' : '180deg'}) scale(${spectator.scale || 1})`,
              opacity: spectator.opacity === undefined ? 1 : spectator.opacity,
              transition: transitionStyle
            }}
          >
            <img
              src={spectator.frontImage}
              alt="spectator front"
              className="spectator-character front-face"
              loading="lazy"
            />
            <img
              src={spectator.backImage}
              alt="spectator back"
              className="spectator-character back-face"
              loading="lazy"
            />
          </div>
        );
      })}
    </div>
  );
};

export default Spectators;

