import React from 'react';
import './SoundSettingsModal.css';

const SoundSettingsModal = ({
  isOpen,
  onClose,
  toggleMute,
  musicVolume,
  setMusicVolume,
  isPlaying,
  setIsPlaying, // Accept setIsPlaying prop
  currentMusicIndex,
  setCurrentMusicIndex,
  allMusicTracks,
  gameMusicRef, // Accept the audio ref
}) => {
  if (!isOpen) return null;

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolume(newVolume); // Update state to keep slider UI in sync

    // Directly manipulate the audio volume for immediate effect
    if (gameMusicRef.current) {
      gameMusicRef.current.volume = newVolume;
    }

    // If user adjusts volume, assume they want to hear it
    if (newVolume > 0) {
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    const nextIndex = (currentMusicIndex + 1) % allMusicTracks.length;
    setCurrentMusicIndex(nextIndex);
  };

  const handlePrevTrack = () => {
    const prevIndex = (currentMusicIndex - 1 + allMusicTracks.length) % allMusicTracks.length;
    setCurrentMusicIndex(prevIndex);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="sound-settings-modal-overlay" onMouseDown={handleClose}>
      <div className="sound-settings-modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <button className="sound-settings-close-button" onMouseDown={handleClose}>X</button>

        <div className="music-controls">
          <button onClick={handlePrevTrack}>{'<'}</button>
          <div className="music-animation-container">
            <div className={`music-animation ${isPlaying ? 'playing' : ''}`}>
              <span className="music-bar"></span>
              <span className="music-bar"></span>
              <span className="music-bar"></span>
            </div>
          </div>
          <button onClick={handleNextTrack}>{'>'}</button>
        </div>

        <div className="track-indicator">
          {allMusicTracks.map((_, index) => (
            <span key={index} className={`track-dot ${index === currentMusicIndex ? 'active' : ''}`}></span>
          ))}
        </div>

        <div className="volume-controls">
          <button onClick={toggleMute}>
            {isPlaying ? '🔊' : '🔇'}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVolume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SoundSettingsModal;