
import React, { useState, useEffect, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { pfpLayerKeys, getPfpImage } from '../assets/CMCpfp';
import './PFPGeneratorModal.css';

const PFPGeneratorModal = ({ onClose }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [activeCategory, setActiveCategory] = useState('backgrounds');
  const canvasRef = useRef(null);
  const tabsRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState({ left: false, right: false });

  const categoryOrder = ['backgrounds', 'other', 'characters', 'clothes', 'hats', 'items'];
  const optionalCategories = ['other', 'clothes', 'hats', 'items'];

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
        right: scrollLeft < scrollWidth - clientWidth - 1,
      });
    }
  };

  const characterIndex = useMemo(() => {
    if (!selectedItems.characters) return -1;
    return pfpLayerKeys.characters.findIndex(c => c === selectedItems.characters);
  }, [selectedItems.characters]);

  const getFilteredItems = (category, charIndex) => {
    const items = pfpLayerKeys[category];
    if (!items || charIndex === -1 || category === 'characters' || category === 'backgrounds') {
      return items;
    }

    const characterId = charIndex + 1;

    return items.filter(item => {
      const match = item.match(/^\.\/(\d+)_/);
      if (match) {
        return parseInt(match[1], 10) === characterId;
      }
      return true;
    });
  };
  
  const generateRandomPFP = () => {
    const randomItems = {};
  
    // First, select a random character
    const charItems = pfpLayerKeys.characters;
    if (charItems && charItems.length > 0) {
      const randomCharIndex = Math.floor(Math.random() * charItems.length);
      randomItems.characters = charItems[randomCharIndex];
      
      // Now, filter other items based on this character
      categoryOrder.forEach(category => {
        if (category === 'characters') return; // Already selected

        if (category === 'other') {
          randomItems[category] = null;
          return;
        }
        
        const filteredItems = getFilteredItems(category, randomCharIndex);
        
        if (filteredItems && filteredItems.length > 0) {
          if (optionalCategories.includes(category) && Math.random() < 0.2) {
            randomItems[category] = null;
          } else {
            const randomIndex = Math.floor(Math.random() * filteredItems.length);
            randomItems[category] = filteredItems[randomIndex];
          }
        } else {
          randomItems[category] = null;
        }
      });
  
      // Ensure background is set
      if (!randomItems.backgrounds) {
        const bgItems = pfpLayerKeys.backgrounds;
        if (bgItems && bgItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * bgItems.length);
          randomItems.backgrounds = bgItems[randomIndex];
        }
      }
  
    } else {
       // Fallback for no characters
       categoryOrder.forEach(category => {
        const items = pfpLayerKeys[category];
        if (items && items.length > 0) {
          const randomIndex = Math.floor(Math.random() * items.length);
          randomItems[category] = items[randomIndex];
        } else {
          randomItems[category] = null;
        }
      });
    }
  
    setSelectedItems(randomItems);
  };

  useEffect(() => {
    generateRandomPFP();
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  useEffect(() => {
    checkScroll();
  }, [pfpLayerKeys, activeCategory]);

  const handleItemSelect = (category, item) => {
    const newItems = { ...selectedItems, [category]: item };

    if (category === 'characters') {
      const newCharIndex = pfpLayerKeys.characters.findIndex(c => c === item);
      
      categoryOrder.forEach(cat => {
        if (cat !== 'characters' && cat !== 'backgrounds') {
          const currentItem = newItems[cat];
          if (currentItem) {
            const filtered = getFilteredItems(cat, newCharIndex);
            if (!filtered.includes(currentItem)) {
              newItems[cat] = null; // Reset if not compatible
            }
          }
        }
      });
    }

    setSelectedItems(newItems);
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

  const filteredItems = useMemo(() => {
    return getFilteredItems(activeCategory, characterIndex);
  }, [activeCategory, characterIndex]);

  return (
    <div className="pfp-generator-modal-overlay" onClick={onClose}>
      <div className="pfp-generator-modal-content" onClick={e => e.stopPropagation()}>
        <div className="pfp-modal-top-bar">
          <div className="pfp-actions">
            <button className="pfp-action-btn" onClick={generateRandomPFP}>Random</button>
            <button className="pfp-action-btn" onClick={handleDownload}>Download</button>
          </div>
          <button className="pfp-generator-modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="pfp-canvas-container">
          <div className="pfp-canvas-square" ref={canvasRef}>
            {categoryOrder.map((category, index) => {
              const itemKey = selectedItems[category];
              if (itemKey) {
                const itemSrc = getPfpImage(category, itemKey);
                return (
                  <img
                    key={category}
                    src={itemSrc}
                    alt={category}
                    className="pfp-layer"
                    loading="lazy"
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
            {filteredItems?.map((item) => (
              <div key={item} className="pfp-item" onClick={() => handleItemSelect(activeCategory, item)}>
                <img src={getPfpImage(activeCategory, item)} alt={item} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PFPGeneratorModal;
