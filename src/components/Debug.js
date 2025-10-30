import React from 'react';
import './Debug.css';

const Debug = ({ playerHitbox, obstacles, cameraX }) => {
  if (!playerHitbox) return null;

  return (
    <div className="debug-overlay">
      {/* Draw Player Hitbox */}
      <div
        className="debug-box player-debug"
        style={{
          width: playerHitbox.width,
          height: playerHitbox.height,
          bottom: `calc(39% + ${playerHitbox.bottom}px)`,
          left: `${playerHitbox.left - cameraX}px`,
        }}
      ></div>

      {/* Draw Obstacle Hitboxes */}
      {obstacles.map(obstacle => (
        <div
          key={`debug-obstacle-${obstacle.id}`}
          className="debug-box obstacle-debug"
          style={{
            width: 40, // OBSTACLE_WIDTH
            height: 80, // OBSTACLE_HEIGHT
            bottom: '39%',
            left: `${obstacle.x - cameraX}px`,
          }}
        ></div>
      ))}
    </div>
  );
};

export default Debug;
