
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { pfpLayers } from '../assets/CMCpfp';
import './PFPGeneratorModal.css';

const PFPGeneratorModal = ({ onClose }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [activeCategory, setActiveCategory] = useState('backgrounds');
  const canvasRef = useRef(null);
  const tabsRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState({ left: false, right: false });

  const categoryOrder = ['backgrounds', 'other1', 'characters', 'clothes', 'hats', 'other2', 'items'];
  const optionalCategories = ['other1', 'clothes', 'hats', 'other2', 'items'];

  const handleScroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowScrollButtons({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 1 
      });
    }
  };

  useEffect(() => {
    generateRandomPFP();
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  useEffect(() => {
    checkScroll();
  }, [pfpLayers, activeCategory]);


  const generateRandomPFP = () => {
    const randomItems = {};
    categoryOrder.forEach(category => {
      const items = pfpLayers[category];
      if (items && items.length > 0) {
        if (optionalCategories.includes(category) && Math.random() < 0.2) {
          randomItems[category] = null;
        } else {
          const randomIndex = Math.floor(Math.random() * items.length);
          randomItems[category] = items[randomIndex];
        }
      } else {
        randomItems[category] = null;
      }
    });
    if (!randomItems.backgrounds) randomItems.backgrounds = pfpLayers.backgrounds[0];
    if (!randomItems.characters) randomItems.characters = pfpLayers.characters[0];
    setSelectedItems(randomItems);
  };

  const handleItemSelect = (category, item) => {
    setSelectedItems(prev => ({ ...prev, [category]: item }));
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      html2canvas(canvasRef.current, { backgroundColor: null }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'cmc-pfp.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div className="pfp-generator-modal-overlay" onClick={onClose}>
      <div className="pfp-generator-modal-content" onClick={e => e.stopPropagation()}>
        <button className="pfp-generator-modal-close" onClick={onClose}>&times;</button>
        
        <div className="pfp-canvas-container">
          <div className="pfp-canvas-square" ref={canvasRef}>
            {categoryOrder.map((category, index) => {
              if (selectedItems[category]) {
                return (
                  <img
                    key={category}
                    src={selectedItems[category]}
                    alt={category}
                    className="pfp-layer"
                    style={{ zIndex: index + 1 }}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>

        <div className="pfp-controls">
          <div className="pfp-category-tabs-container">
            {showScrollButtons.left && (
              <button className="scroll-btn left" onClick={() => handleScroll('left')}>‹</button>
            )}
            <div className="pfp-category-tabs" ref={tabsRef} onScroll={checkScroll}>
              {categoryOrder.map(category => (
                <button
                  key={category}
                  className={`pfp-category-tab ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            {showScrollButtons.right && (
              <button className="scroll-btn right" onClick={() => handleScroll('right')}>›</button>
            )}
          </div>

          <div className="pfp-items-grid">
            {optionalCategories.includes(activeCategory) && (
              <div className="none-item" onClick={() => handleItemSelect(activeCategory, null)}>
                Ø
              </div>
            )}
            {pfpLayers[activeCategory]?.map((item) => (
              <div key={item} className="pfp-item" onClick={() => handleItemSelect(activeCategory, item)}>
                <img src={item} alt={item} />
              </div>
            ))}
          </div>

          <div className="pfp-actions">
            <button className="pfp-action-btn" onClick={generateRandomPFP}>Random</button>
            <button className="pfp-action-btn" onClick={handleDownload}>Download</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PFPGeneratorModal;
