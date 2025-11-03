import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Game.css';
import Obstacle from './Obstacle';
import Coin from './Coin';
import Spectators from './Spectators';
import Debug from './Debug'; // Import the Debug component

// Animation frames
import frame1 from '../assets/game/pozisyon(1).png';
import frame2 from '../assets/game/pozisyon(2).png';
import frame3 from '../assets/game/pozisyon(3).png';
import frame4 from '../assets/game/pozisyon(4).png';
import frame5 from '../assets/game/pozisyon(5).png';
import frame6 from '../assets/game/pozisyon(6).png';
import frame7 from '../assets/game/pozisyon(7).png';
import frame8 from '../assets/game/pozisyon(8).png';
import frame9 from '../assets/game/pozisyon(9).png';
import frame10 from '../assets/game/pozisyon(10).png';
import frame11 from '../assets/game/pozisyon(11).png';
import frame12 from '../assets/game/pozisyon(12).png';
import frame13 from '../assets/game/pozisyon(13).png';

// Game assets
import gameBG from '../assets/game/BGgame.png';
import gameWay from '../assets/game/gameWAY.png';
import uMARSgame from '../assets/game/uMARSgame.png';
import uMERCURYgame from '../assets/game/uMERCURYgame.png';
import uNEPTÜNgame from '../assets/game/uNEPTÜNgame.png';
import uSATÜRNgame from '../assets/game/uSATÜRNgame.png';
import uSUNgame from '../assets/game/uSUNgame.png';
import uTON618game from '../assets/game/uTON618game.png';
import uTON618game1 from '../assets/game/uTON618game1.png';
import uURANÜSgame from '../assets/game/uURANÜSgame.png';
import uVENÜSgame from '../assets/game/uVENÜSgame.png';
import uWORLDgame from '../assets/game/uWORLDgame.png';


// Sound Assets
import sound1 from '../assets/game/sound/sound (1).mp3';
import sound2 from '../assets/game/sound/sound (2).mp3';
import sound3 from '../assets/game/sound/sound (3).mp3';
import blackHoleSoundFile from '../assets/game/sound/BlackHole.mp3';
import SoundSettingsModal from './SoundSettingsModal';

// --- GAME CONSTANTS ---
const runFrames = [frame1, frame2, frame3, frame4];
const jumpFrames = [frame5, frame6, frame7, frame8, frame9, frame10, frame11, frame12, frame13];
const JUMP_FORCE = 21;
const GRAVITY = 1.1;
const GAME_SPEED = 5; // Player's forward speed in world units
const PLAYER_SCREEN_X_OFFSET_PERCENT = 0.15; // Player is at 15% of the screen width

// Entity Dimensions
const PLAYER_WIDTH = 65;
const PLAYER_HEIGHT = 113;
const PLAYER_HITBOX_WIDTH_FACTOR = 0.30; // Adjust this to change hitbox width (e.g., 0.5 for 50%)
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 80;
const COIN_WIDTH = 40;
const COIN_HEIGHT = 40;

const ALL_GAME_MUSIC = [sound1, sound2, sound3];
const PLANET_IMAGES = [uMARSgame, uMERCURYgame, uNEPTÜNgame, uSATÜRNgame, uSUNgame, uURANÜSgame, uVENÜSgame, uWORLDgame];

// Dynamically import all character images from the Caracter folder
const importAll = (r) => {
  const cache = {};
  r.keys().forEach((key) => {
    cache[key] = r(key);
  });
  return cache;
};

const backImages = importAll(require.context('../assets/game/Caracter', false, /backCaracter.*\.png$/));
const frontImages = importAll(require.context('../assets/game/Caracter', false, /frontCaracter.*\.png$/));

// Create a matched list of characters by parsing filenames
const characterMap = {};

Object.keys(frontImages).forEach(path => {
  const match = path.match(/frontCaracter \((\d+)\)/);
  if (match) {
    const num = match[1];
    if (!characterMap[num]) characterMap[num] = {};
    characterMap[num].front = frontImages[path];
  }
});

Object.keys(backImages).forEach(path => {
  const match = path.match(/backCaracter \((\d+)\)/);
  if (match) {
    const num = match[1];
    if (!characterMap[num]) characterMap[num] = {};
    characterMap[num].back = backImages[path];
  }
});

const characters = Object.values(characterMap).filter(c => c.front && c.back);



const Game = ({ score, setScore, isSoundModalOpen, setIsSoundModalOpen }) => {
  // React State
  const [playerState, setPlayerState] = useState('running');
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [cameraX, setCameraX] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [coins, setCoins] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [runFrameIndex, setRunFrameIndex] = useState(0);
  const [jumpFrameIndex, setJumpFrameIndex] = useState(0);
  const [scoreToAdd, setScoreToAdd] = useState(0);
  const [screenDimensions, setScreenDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [spectators, setSpectators] = useState([]);
  const [gamePhase, setGamePhase] = useState('planets'); // 'planets', 'blackhole', 'normal'
  const [planets, setPlanets] = useState([]);
  const [blackHole, setBlackHole] = useState(null);
  const [shakeStyle, setShakeStyle] = useState({});
  const [blackHoleImage, setBlackHoleImage] = useState(uTON618game1);
  const [isShaking, setIsShaking] = useState(false);
  const [debugMode, setDebugMode] = useState(false); // Add debug mode state
  const [playerHitboxForDebug, setPlayerHitboxForDebug] = useState(null); // Add state for debug hitbox

  // Sound State
  const gameMusicRef = useRef(null);
  const blackHoleSoundRef = useRef(null);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(() => {
    const savedIndex = localStorage.getItem('gameMusicIndex');
    // Ensure the loaded index is within the bounds of the available music
    const savedIndexNumber = savedIndex !== null ? parseInt(savedIndex, 10) : 0;
    return savedIndexNumber < ALL_GAME_MUSIC.length ? savedIndexNumber : 0;
  });
  const [musicVolume, setMusicVolume] = useState(() => {
    const savedVolume = localStorage.getItem('gameMusicVolume');
    return savedVolume !== null ? parseFloat(savedVolume) : 0.5;
  });
  const [isPlaying, setIsPlaying] = useState(() => {
    const savedIsPlaying = localStorage.getItem('gameIsPlaying');
    return savedIsPlaying !== null ? JSON.parse(savedIsPlaying) : true;
  });
  const volumeBeforeMute = useRef(0.5);

  // Refs for game loop logic
  const animationFrameRef = useRef(null);
  const gameContainerRef = useRef(null);
  const playerImageRef = useRef(null); // Ref for the player image element
  const playerPhysicsRef = useRef({ x: 0, y: 0, vy: 0, isJumping: false, shakeIntensity: 0 });
  const playerDimensions = useRef({ width: PLAYER_WIDTH, height: PLAYER_HEIGHT }); // Ref for player dimensions
  const cameraRef = useRef({ x: 0 });
  const inputRef = useRef({ jumpPressed: false });
  const spawnerRef = useRef({ obstacleTimer: 150, coinTimer: 100, planetTimer: 200, spawnedPlanetCount: 0 });
  const scoredCoinIds = useRef(new Set());
  const shuffledPlanets = useRef([]);

  // --- SPECTATOR GENERATION ---
  const generateSpectators = useCallback(() => {
    const container = document.querySelector('.spectators-container');
    if (!container) return;

    const charWidth = 50;
    const charHeight = 75;
    const width = container.offsetWidth - charWidth;
    const height = container.offsetHeight - charHeight;
    const minRadius = 75;
    const maxTries = 30;

    const poissonSample = () => {
      if (width <= 0 || height <= 0) return [];
      const points = [];
      const active = [];
      const grid = [];
      const cellSize = Math.floor(minRadius / Math.sqrt(2));
      const cols = Math.floor(width / cellSize) + 1;
      const rows = Math.floor(height / cellSize) + 1;

      for (let i = 0; i < cols * rows; i++) grid[i] = undefined;

      function addPoint(p) {
        points.push(p);
        active.push(p);
        const col = Math.floor(p.x / cellSize);
        const row = Math.floor(p.y / cellSize);
        grid[col + row * cols] = p;
      }

      for (let i = 0; i < 5; i++) {
          addPoint({ x: Math.random() * width, y: Math.random() * height });
      }

      while (active.length > 0) {
        const randIndex = Math.floor(Math.random() * active.length);
        const pos = active[randIndex];
        let found = false;

        for (let k = 0; k < maxTries; k++) {
          const angle = Math.random() * 2 * Math.PI;
          const radius = Math.random() * minRadius + minRadius;
          const newX = pos.x + Math.cos(angle) * radius;
          const newY = pos.y + Math.sin(angle) * radius;
          const newPos = { x: newX, y: newY };

          if (newX > 0 && newX < width && newY > 0 && newY < height) {
            const col = Math.floor(newX / cellSize);
            const row = Math.floor(newY / cellSize);
            let isSafe = true;

            for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                const neighborIndex = (col + i) + (row + j) * cols;
                if (neighborIndex < 0 || neighborIndex >= grid.length) continue;
                const neighbor = grid[neighborIndex];
                if (neighbor) {
                  const d = Math.sqrt(Math.pow(newPos.x - neighbor.x, 2) + Math.pow(newPos.y - neighbor.y, 2));
                  if (d < minRadius) {
                    isSafe = false;
                  }
                }
              }
            }

            if (isSafe) {
              addPoint(newPos);
              found = true;
              break;
            }
          }
        }

        if (!found) {
          active.splice(randIndex, 1);
        }
      }
      return points;
    };

    const points = poissonSample();
    const newSpectators = characters.slice(0, points.length).map((character, i) => ({
      id: i,
      ...points[i],
      frontImage: character.front,
      backImage: character.back,
      isFront: Math.random() > 0.5,
      lastFlipTime: 0,
    }));

    setSpectators(newSpectators);
  }, []);

  useEffect(() => {
    shuffledPlanets.current = [...PLANET_IMAGES].sort(() => Math.random() - 0.5);
    generateSpectators();
    window.addEventListener('resize', generateSpectators);
    return () => window.removeEventListener('resize', generateSpectators);
  }, [generateSpectators]);

  useEffect(() => {
    const flipInterval = setInterval(() => {
      const now = Date.now();
      const flipCooldown = 5000; // 5 seconds
      const flipChance = 0.1; // 10% chance

      setSpectators(prevSpectators =>
        prevSpectators.map(spectator => {
          if (now - (spectator.lastFlipTime || 0) > flipCooldown && Math.random() < flipChance) {
            return { ...spectator, isFront: !spectator.isFront, lastFlipTime: now };
          }
          return spectator;
        })
      );
    }, 2000); // Check every 2 seconds

    return () => clearInterval(flipInterval);
  }, []);


  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * ALL_GAME_MUSIC.length);
    setCurrentMusicIndex(randomIndex);
  }, []);

  // --- LIFECYCLE & SETUP ---
  useEffect(() => {
    const handleResize = () => setScreenDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsGamePaused(isSoundModalOpen);
  }, [isSoundModalOpen]);

  const toggleMute = useCallback(() => {
    if (musicVolume > 0) {
      volumeBeforeMute.current = musicVolume;
      setMusicVolume(0);
      setIsPlaying(false); // Also set isPlaying to false
      console.log('Muting, setting volume to 0, isPlaying to false');
    } else {
      const newVolume = volumeBeforeMute.current || 0.5;
      setMusicVolume(newVolume);
      setIsPlaying(true); // Also set isPlaying to true
      console.log('Unmuting, setting volume to:', newVolume, 'isPlaying to true');
    }
  }, [musicVolume]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (gameMusicRef.current) {
        gameMusicRef.current.pause();
      }
      if (blackHoleSoundRef.current) {
        blackHoleSoundRef.current.pause();
      }
    };
  }, []);

  // --- MAIN GAME LOOP ---
  useEffect(() => {
    if (isGameOver || isGamePaused) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    let lastTime = 0;
    const update = (time) => {
      if (lastTime === 0) {
        lastTime = time;
        animationFrameRef.current = requestAnimationFrame(update);
        return;
      }
      const deltaTime = (time - lastTime) / 16.67; // Normalize to 60 FPS
      lastTime = time;

      // --- Game Phase Logic ---
      const spawner = spawnerRef.current;
      if (gamePhase === 'planets') {
        spawner.planetTimer -= deltaTime;
        if (spawner.planetTimer <= 0 && spawner.spawnedPlanetCount < 7) {
          const spawnX = cameraRef.current.x + screenDimensions.width;
          const newPlanet = {
            id: Date.now(),
            x: spawnX,
            y: screenDimensions.height * 0.1 + Math.random() * (screenDimensions.height * 0.1),
            image: shuffledPlanets.current[spawner.spawnedPlanetCount],
            speed: Math.random() * 2 + 1,
          };
          setPlanets(prev => [...prev, newPlanet]);
          spawner.spawnedPlanetCount++;
          spawner.planetTimer = Math.random() * 150 + 100;
        }
        setPlanets(prev => prev.map(p => ({ ...p, x: p.x - p.speed * deltaTime })).filter(p => p.x > cameraRef.current.x - 200));
        if (spawner.spawnedPlanetCount >= 7 && planets.length === 0) {
          setGamePhase('blackhole');
        }
      } else if (gamePhase === 'blackhole' && !blackHole) {
        setBlackHole({
          id: 'ton618',
          x: screenDimensions.width / 2,
          y: -200,
          targetX: screenDimensions.width / 2,
          targetY: screenDimensions.height * 0.15,
          scale: 2, // Initial scale
          baseScale: 2, // Base reference scale
          scaleTime: 0,
          active: true,
          sucking: false,
          wandering: false,
          dx: (Math.random() - 0.5) * 2,
          dy: (Math.random() - 0.5) * 2,
        });
        if (gameMusicRef.current) gameMusicRef.current.volume = musicVolume * 0.2;
        if (!blackHoleSoundRef.current) {
          blackHoleSoundRef.current = new Audio(blackHoleSoundFile);
          blackHoleSoundRef.current.loop = true;
          blackHoleSoundRef.current.volume = musicVolume;
        }
        if (musicVolume > 0) blackHoleSoundRef.current.play().catch(e => console.error("Play error:", e));
        playerPhysicsRef.current.shakeIntensity = 15; // Start screen shake
        setIsShaking(true);
      }

      if (blackHole && blackHole.active) {
        setBlackHole(bh => {
          let newY = bh.y;
          let newX = bh.x;
          let newScale = bh.scale;
          let newScaleTime = bh.scaleTime;
          let newDx = bh.dx;
          let newDy = bh.dy;
          let isSucking = bh.sucking;
          let isWandering = bh.wandering;

          // --- Black Hole Movement & Scaling ---
          if (!isWandering) {
            // Sucking Phase - hold scale constant
            newScale = bh.baseScale;
            newX = screenDimensions.width / 2;
            if (newY < bh.targetY) {
              newY = Math.min(newY + 2 * deltaTime, bh.targetY);
            } else if (!isSucking) {
              isSucking = true; // Start the sucking phase
            }
          } else { // isWandering
            const spawner = spawnerRef.current;
            spawner.wanderTimer = (spawner.wanderTimer || 0) - deltaTime;

            // Periodically change direction for more interesting movement
            if (spawner.wanderTimer <= 0) {
              newDx = (Math.random() - 0.5) * 2; // New random direction
              newDy = (Math.random() - 0.5) * 2;
              spawner.wanderTimer = Math.random() * 180 + 120; // Reset timer (2-5 seconds)
            }

            newX += newDx * deltaTime;
            newY += newDy * deltaTime;

            // Pulsating scale effect based on baseScale
            newScaleTime += 0.05 * deltaTime;
            newScale = bh.baseScale + Math.sin(newScaleTime) * 0.25;

            // Boundary checks that account for current scale and clamp position
            const blackHoleWidth = 150 * newScale;
            const blackHoleHeight = 150 * newScale; // Assuming square
            if (newX < 0) { newX = 0; newDx = Math.abs(newDx); }
            if (newX > screenDimensions.width - blackHoleWidth) { newX = screenDimensions.width - blackHoleWidth; newDx = -Math.abs(newDx); }
            if (newY < 0) { newY = 0; newDy = Math.abs(newDy); }
            if (newY > screenDimensions.height * 0.4 - blackHoleHeight) { newY = screenDimensions.height * 0.4 - blackHoleHeight; newDy = -Math.abs(newDy); }
          }

          // --- Spectator Sucking & Animation Logic ---
          const spawner = spawnerRef.current;
          if (isSucking && !isWandering) {
            const container = document.querySelector('.spectators-container');
            if (container && gameContainerRef.current) {
              const containerRect = container.getBoundingClientRect();
              const gameContainerRect = gameContainerRef.current.getBoundingClientRect();
              const offsetY = containerRect.top - gameContainerRect.top;

              setSpectators(prevSpectators => {
                let spectatorsToUpdate = [...prevSpectators];

                // The black hole's (x, y) is its center. Target that.
                let targetX = bh.x;
                let targetY = bh.y - offsetY;

                // Adjust target to account for spectator's own dimensions (center to center)
                const spectatorWidth = 50; // from Spectators.css
                const spectatorHeight = 75; // Approximate, based on generateSpectators
                targetX -= spectatorWidth / 2;
                targetY -= spectatorHeight / 2;

                // 1. Animate any spectator that is already being sucked
                spectatorsToUpdate = spectatorsToUpdate.map(spec => {
                  if (spec.isBeingSucked) {
                    const initialDistance = spec.initialSuckDistance || Math.sqrt(Math.pow(targetX - spec.x, 2) + Math.pow(targetY - spec.y, 2));

                    const distX = targetX - spec.x;
                    const distY = targetY - spec.y;
                    const currentDistance = Math.sqrt(distX * distX + distY * distY);

                    const constantSpeed = 30; // Move at a constant speed
                    const moveAmount = constantSpeed * deltaTime;

                    if (currentDistance <= moveAmount) {
                      // If the next move would overshoot or land on the target, mark as sucked.
                      return { ...spec, isBeingSucked: false, sucked: true, opacity: 0 };
                    } else {
                      const dirX = distX / currentDistance;
                      const dirY = distY / currentDistance;

                      const newSpecX = spec.x + dirX * moveAmount;
                      const newSpecY = spec.y + dirY * moveAmount;

                      // Return the spectator with updated position but constant scale
                      return { ...spec, x: newSpecX, y: newSpecY, initialSuckDistance: initialDistance };
                    }
                  }
                  return spec;
                });

                const anyBeingSucked = spectatorsToUpdate.some(s => s.isBeingSucked);

                // 2. If no one is being sucked, and timer is up, pick a new one
                const unSucked = spectatorsToUpdate.filter(s => !s.sucked && !s.isBeingSucked);
                if (!anyBeingSucked && unSucked.length > 0) {
                  const randomIndex = Math.floor(Math.random() * unSucked.length);
                  const spectatorToSuckId = unSucked[randomIndex].id;
                  
                  spectatorsToUpdate = spectatorsToUpdate.map(s => 
                    s.id === spectatorToSuckId ? { ...s, isBeingSucked: true } : s
                  );
                }

                // 3. Check if all spectators are sucked to transition state
                const allSucked = spectatorsToUpdate.every(s => s.sucked);
                if (allSucked) {
                  setTimeout(() => {
                    setBlackHole(b => ({ ...b, sucking: false, wandering: true }));
                    if (blackHoleSoundRef.current) blackHoleSoundRef.current.pause();
                    if (gameMusicRef.current) gameMusicRef.current.volume = musicVolume;
                    setGamePhase('normal');
                  }, 2000);
                }

                return spectatorsToUpdate;
              });
            }
          }

          return { ...bh, y: newY, x: newX, scale: newScale, scaleTime: newScaleTime, dx: newDx, dy: newDy, sucking: isSucking, wandering: isWandering };
        });
      }


      // --- Physics & Movement ---
      const physics = playerPhysicsRef.current;
      const prevY = physics.y;

      physics.x += GAME_SPEED * deltaTime;
      physics.vy -= GRAVITY * deltaTime;

      if (inputRef.current.jumpPressed && !physics.isJumping) {
        physics.vy = JUMP_FORCE;
        physics.isJumping = true;
      }
      inputRef.current.jumpPressed = false;
      physics.y += physics.vy * deltaTime;

      cameraRef.current.x = physics.x - (screenDimensions.width * PLAYER_SCREEN_X_OFFSET_PERCENT);

      const hitboxWidth = playerDimensions.current.width * PLAYER_HITBOX_WIDTH_FACTOR;
      const xOffset = (playerDimensions.current.width - hitboxWidth) / 2; // Center the hitbox
      const playerHitbox = {
        left: physics.x + xOffset,
        right: physics.x + xOffset + hitboxWidth,
        bottom: physics.y,
        top: physics.y + playerDimensions.current.height,
        width: hitboxWidth, // for debug
        height: playerDimensions.current.height, // for debug
      };
      setPlayerHitboxForDebug(playerHitbox);

      let didGameOver = false;
      let landedOnObstacle = false;

      // --- Obstacle Spawning ---
      spawner.obstacleTimer -= deltaTime;
      let newObstacles = [];
      if (spawner.obstacleTimer <= 0) {
        const groupSize = Math.floor(Math.random() * 3) + 1;
        const spawnX = cameraRef.current.x + screenDimensions.width;
        for (let i = 0; i < groupSize; i++) {
          newObstacles.push({ id: Date.now() + i, x: spawnX + i * OBSTACLE_WIDTH });
        }
        spawner.obstacleTimer = Math.random() * 120 + 120; // Reset timer
      }
      
      const combinedObstacles = [...obstacles, ...newObstacles];

      // --- Obstacle Collision ---
      for (const obstacle of combinedObstacles) {
        const obstacleHitbox = {
          left: obstacle.x,
          right: obstacle.x + OBSTACLE_WIDTH,
          bottom: 0,
          top: OBSTACLE_HEIGHT
        };

        const isXOverlapping = playerHitbox.right > obstacleHitbox.left && playerHitbox.left < obstacleHitbox.right;
        const isYOverlapping = playerHitbox.top > obstacleHitbox.bottom && playerHitbox.bottom < obstacleHitbox.top;

        if (isXOverlapping && isYOverlapping) {
          const wasAbove = prevY >= obstacleHitbox.top;

          if (wasAbove && physics.vy <= 0) {
            physics.y = obstacleHitbox.top;
            physics.vy = 0;
            physics.isJumping = false;
            landedOnObstacle = true;
            break; // Landed on one, that's enough for this frame
          } else {
            didGameOver = true;
            break; 
          }
        }
      }
      
      // --- Obstacle Filtering ---
      setObstacles(combinedObstacles.filter(o => o.x > cameraRef.current.x - OBSTACLE_WIDTH));

      if (physics.y < 0) {
        physics.y = 0;
        physics.vy = 0;
        physics.isJumping = false;
      }

      // --- Coin Updates (Collection, Spawning, Filtering) ---
      setCoins(currentCoins => {
        spawner.coinTimer -= deltaTime;
        let newCoins = [];
        if (spawner.coinTimer <= 0) {
            const spawnX = cameraRef.current.x + screenDimensions.width;
            newCoins.push({ id: Date.now(), x: spawnX, y: Math.random() * 100 + 120 });
            spawner.coinTimer = Math.random() * 90 + 60;
        }

        const collectedCoinIds = new Set();
        const remainingCoins = [...currentCoins, ...newCoins].filter(coin => {
          if (coin.x > cameraRef.current.x - COIN_WIDTH) {
            if (playerHitbox.right > coin.x && playerHitbox.left < coin.x + COIN_WIDTH &&
                playerHitbox.top > coin.y && playerHitbox.bottom < coin.y + COIN_HEIGHT) {
              collectedCoinIds.add(coin.id);
              return false;
            }
            return true;
          }
          return false;
        });

        if (collectedCoinIds.size > 0) {
          let newPoints = 0;
          for (const coinId of collectedCoinIds) {
              if (!scoredCoinIds.current.has(coinId)) {
                  newPoints++;
                  scoredCoinIds.current.add(coinId);
              }
          }
          if (newPoints > 0) {
              setScore(prev => prev + newPoints);
          }
        }
        return remainingCoins;
      });

      // --- Final State Updates ---
      const intensity = playerPhysicsRef.current.shakeIntensity;
      if (intensity > 0) {
        const shakeX = (Math.random() - 0.5) * intensity;
        const shakeY = (Math.random() - 0.5) * intensity;
        setShakeStyle({ transform: `translate(${shakeX}px, ${shakeY}px)` });

        if (blackHole && blackHole.wandering) {
          playerPhysicsRef.current.shakeIntensity = Math.max(0, intensity - 0.2 * deltaTime);
        }
      } else {
        setShakeStyle({});
        if (isShaking) {
          setIsShaking(false);
          setBlackHoleImage(uTON618game);
        }
      }

      // Set render states based on final physics values for this frame
      const correctedCameraX = physics.x - (screenDimensions.width * PLAYER_SCREEN_X_OFFSET_PERCENT);
      setCameraX(correctedCameraX);
      setPlayerPosition({ x: physics.x, y: physics.y });
      setPlayerState((!didGameOver && (physics.y === 0 || landedOnObstacle)) ? 'running' : 'jumping');

      // NOW, check if the game should end.
      if (didGameOver) {
        setIsGameOver(true);
        return; // Stop the loop HERE.
      }

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isGameOver, isGamePaused, screenDimensions.width, gamePhase, blackHole, planets, musicVolume]);

  const restartGame = useCallback(() => {
    setIsGameOver(false);
    setObstacles([]);
    setCoins([]);
    setPlayerState('running');
    playerPhysicsRef.current = { x: 0, y: 0, vy: 0, isJumping: false, shakeIntensity: 0 };
    cameraRef.current = { x: 0 };
    spawnerRef.current = { obstacleTimer: 150, coinTimer: 100, planetTimer: 200, spawnedPlanetCount: 0 };
    shuffledPlanets.current = [...PLANET_IMAGES].sort(() => Math.random() - 0.5);
    setPlayerPosition({ x: 0, y: 0 });
    setCameraX(0);
    setScore(0);
    setRunFrameIndex(0);
    setJumpFrameIndex(0);
    setGamePhase('planets');
    setPlanets([]);
    setBlackHole(null);
    scoredCoinIds.current.clear();
    generateSpectators();
    if (gameMusicRef.current) {
        gameMusicRef.current.pause();
        gameMusicRef.current.currentTime = 0;
    }
    if (blackHoleSoundRef.current) {
        blackHoleSoundRef.current.pause();
        blackHoleSoundRef.current.currentTime = 0;
    }
  }, [setScore, generateSpectators]);

  // --- INPUT HANDLERS ---
  const handlePressStart = useCallback((e) => {
    if (e) e.preventDefault();
    if (isSoundModalOpen) return; // Prevent jump when modal is open
    if (isGameOver) {
      restartGame();
      return;
    }
    if (!playerPhysicsRef.current.isJumping) {
      inputRef.current.jumpPressed = true;
    }
  }, [isGameOver, restartGame, isSoundModalOpen]);

  const handlePressEnd = useCallback((e) => {
    if (e) e.preventDefault();
  }, []);

  useEffect(() => {
    const gameElement = gameContainerRef.current;
    if (!gameElement) return;
    const options = { passive: false };
    gameElement.addEventListener('mousedown', handlePressStart, options);
    gameElement.addEventListener('mouseup', handlePressEnd, options);
    gameElement.addEventListener('touchstart', handlePressStart, options);
    gameElement.addEventListener('touchend', handlePressEnd, options);
    const handleKeyDown = (e) => { if (e.code === 'Space' && !e.repeat) handlePressStart(e); };
    const handleKeyUp = (e) => { if (e.code === 'Space') handlePressEnd(e); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      gameElement.removeEventListener('mousedown', handlePressStart);
      gameElement.removeEventListener('mouseup', handlePressEnd);
      gameElement.removeEventListener('touchstart', handlePressStart);
      gameElement.removeEventListener('touchend', handlePressEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePressStart, handlePressEnd]);

  // --- ANIMATION & SOUND EFFECTS ---
  useEffect(() => {
    if (isGamePaused) return;
    const animationInterval = setInterval(() => {
      if (playerState === 'running') {
        setRunFrameIndex(prevFrame => (prevFrame + 1) % runFrames.length);
        setJumpFrameIndex(0);
      } else if (playerState === 'jumping') {
        setJumpFrameIndex(prevFrame => Math.min(prevFrame + 1, jumpFrames.length - 1));
        setRunFrameIndex(0);
      }
    }, 100);
    return () => clearInterval(animationInterval);
  }, [playerState, isGamePaused]);

  useEffect(() => {
    // Create the audio object if it doesn't exist
    if (!gameMusicRef.current) {
      gameMusicRef.current = new Audio(ALL_GAME_MUSIC[currentMusicIndex]);
      gameMusicRef.current.loop = true;
    }

    // Update src and load if the track changes
    if (gameMusicRef.current.src !== ALL_GAME_MUSIC[currentMusicIndex]) {
      gameMusicRef.current.src = ALL_GAME_MUSIC[currentMusicIndex];
      gameMusicRef.current.load();
    }

    // Handle play/pause for the main music
    if (isPlaying && !isGameOver && gamePhase !== 'blackhole') {
      gameMusicRef.current.play().catch(e => console.error("Play error:", e));
    } else {
      gameMusicRef.current.pause();
    }

    // Handle play/pause for the black hole sound
    if (blackHoleSoundRef.current) {
      if (isPlaying && !isGameOver && gamePhase === 'blackhole') {
        blackHoleSoundRef.current.play().catch(e => console.error("Play error:", e));
      } else {
        blackHoleSoundRef.current.pause();
      }
    }
  }, [currentMusicIndex, isPlaying, isGameOver, gamePhase]);

  useEffect(() => {
    if (gameMusicRef.current) {
      gameMusicRef.current.volume = musicVolume;
      console.log('Setting gameMusicRef volume to:', musicVolume);
    }
    if (blackHoleSoundRef.current) {
      blackHoleSoundRef.current.volume = musicVolume;
      console.log('Setting blackHoleSoundRef volume to:', musicVolume);
    }
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem('gameMusicVolume', musicVolume);
    localStorage.setItem('gameIsPlaying', JSON.stringify(isPlaying));
    localStorage.setItem('gameMusicIndex', currentMusicIndex);
  }, [musicVolume, isPlaying, currentMusicIndex]);

  useEffect(() => {
    const measurePlayer = () => {
      if (playerImageRef.current) {
        playerDimensions.current = {
          width: playerImageRef.current.offsetWidth,
          height: playerImageRef.current.offsetHeight
        };
      }
    };

    // Initial measure after a short delay to ensure image is loaded
    const timeoutId = setTimeout(measurePlayer, 100);

    window.addEventListener('resize', measurePlayer);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', measurePlayer);
    };
  }, []);




  const playerImage = playerState === 'jumping' ? jumpFrames[jumpFrameIndex] : runFrames[runFrameIndex];
  const playerScreenX = screenDimensions.width * PLAYER_SCREEN_X_OFFSET_PERCENT;

  return (
    <div
      ref={gameContainerRef}
      className={`game-container`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${gameBG})`,
              backgroundPosition: `-${cameraX * 0.1}px 0`,
              ...shakeStyle
            }}
          >
            {debugMode && <Debug playerHitbox={playerHitboxForDebug} obstacles={obstacles} cameraX={cameraX} />}
            <SoundSettingsModal        isOpen={isSoundModalOpen}
        onClose={() => { setIsSoundModalOpen(false); }}
        toggleMute={toggleMute}
        musicVolume={musicVolume}
        setMusicVolume={setMusicVolume}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying} // Pass setIsPlaying to the modal
        currentMusicIndex={currentMusicIndex}
        setCurrentMusicIndex={setCurrentMusicIndex}
        allMusicTracks={ALL_GAME_MUSIC}
        gameMusicRef={gameMusicRef}
      />
      <div
        className="game-road"
        style={{
          backgroundImage: `url(${gameWay})`,
          backgroundPosition: `-${cameraX % 2048}px bottom`
        }}
      ></div>
      <Spectators spectators={spectators} blackHole={blackHole} isPaused={isGamePaused} />

      {planets.map(planet => (
        <img 
          key={planet.id}
          src={planet.image}
          alt="planet"
          className="planet"
          style={{
            left: `${planet.x - cameraX}px`,
            top: `${planet.y}px`,
          }}
        />
      ))}

      {blackHole && blackHole.active && (
        <img
          src={blackHoleImage}
          alt="black hole"
          className={`black-hole ${!isShaking ? 'transition-glow' : ''}`}
          style={{
            left: `${blackHole.x}px`,
            top: `${blackHole.y}px`,
            transform: `translate(-50%, -50%) scale(${blackHole.scale})`,
          }}
        />
      )}

      {isGameOver && (
        <div className="game-over-message">
          Game Over
          <button className="restart-button" onClick={restartGame}>Yeniden Başla</button>
        </div>
      )}

      <img
        ref={playerImageRef}
        src={playerImage}
        alt="Player"
        className={'player-character'}
        style={{
          bottom: `calc(39% + ${playerPosition.y}px)`,
          left: `${playerScreenX}px`
        }}
      />
      {obstacles.map(obstacle => (
          <Obstacle 
              key={obstacle.id} 
              id={obstacle.id} 
              x={obstacle.x - cameraX} 
          />
      ))}
      {coins.map(coin => (
          <Coin 
              key={coin.id} 
              id={coin.id} 
              y={coin.y} 
              x={coin.x - cameraX} 
          />
      ))}

    </div>
  );
};

export default Game;
