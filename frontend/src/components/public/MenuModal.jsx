import React, { useState } from 'react';
import BrandLogo from '../BrandLogo';
import './MenuModal.css';

const MenuModal = ({ isOpen, onClose, menuData }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  
  if (!isOpen) return null;

  const totalSlides = menuData.sections.length;

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  const currentSection = menuData.sections[activeSlide];

  return (
    <div className="menu-modal-overlay" onClick={onClose}>
      <div className="menu-book-container" onClick={(e) => e.stopPropagation()}>
        <button className="menu-close-btn" onClick={onClose}>&times;</button>
        
        <div className="menu-book-sidebar">
          <div className="sidebar-branding">
            <BrandLogo size="md" className="menu-modal-logo" />
            <div className="divider-sm"></div>
            <h2 className="restaurant-name">{menuData.title}</h2>
          </div>
          
          <nav className="menu-navigation">
            {menuData.sections.map((section, idx) => (
              <button 
                key={idx} 
                className={`nav-item ${activeSlide === idx ? 'active' : ''}`}
                onClick={() => setActiveSlide(idx)}
              >
                <span className="nav-number">{idx + 1}</span>
                <span className="nav-label">{section.name}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <p>Curated by Executive Chef</p>
          </div>
        </div>

        <div className="menu-book-page">
          <div className="page-header">
            <span className="page-category">{currentSection.name}</span>
            <div className="page-controls">
              <button className="control-btn" onClick={prevSlide} disabled={totalSlides <= 1}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <span className="page-count">{activeSlide + 1} / {totalSlides}</span>
              <button className="control-btn" onClick={nextSlide} disabled={totalSlides <= 1}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="page-content animate-slide">
            <div className="items-list">
              {currentSection.items.map((item, iIdx) => (
                <div key={iIdx} className="luxury-menu-item">
                  <div className="item-main">
                    <h4 className="item-name">{item.name}</h4>
                    <span className="item-price">{item.price}</span>
                  </div>
                  <p className="item-description">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="page-footer-decoration">
            <div className="gold-ornament"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
