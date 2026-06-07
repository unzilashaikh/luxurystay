import { useState, useEffect } from 'react';
import './PublicComponents.css';

const HeroSection = ({ slides, title, tagline, backgroundImage, videoUrl }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // If slides prop is provided, handle carousel logic
  useEffect(() => {
    if (slides && slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [slides]);

  const activeSlide = slides ? slides[currentSlide] : { title, tagline, backgroundImage, videoUrl };

  return (
    <section className="hero-section">
      <div className="hero-slide-container">
        {slides ? (
          slides.map((slide, idx) => (
            <div 
              key={idx} 
              className={`hero-slide ${currentSlide === idx ? 'active' : ''}`}
              style={{ backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none' }}
            >
              {slide.videoUrl && currentSlide === idx && (
                <video autoPlay muted loop className="hero-video">
                  <source src={slide.videoUrl} type="video/mp4" />
                </video>
              )}
            </div>
          ))
        ) : (
          <div 
            className="hero-slide active"
            style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
          >
            {videoUrl && (
              <video autoPlay muted loop className="hero-video">
                <source src={videoUrl} type="video/mp4" />
              </video>
            )}
          </div>
        )}
      </div>

      <div className="hero-overlay-soft"></div>
      
      <div className="container hero-content-center">
        <div className="hero-text-wrapper animate-up">
          <h1 className="hero-title-elegant">{activeSlide.title}</h1>
          {activeSlide.tagline && <p className="hero-tagline">{activeSlide.tagline}</p>}
        </div>
      </div>

      {slides && (
        <div className="hero-indicators">
          {slides.map((_, idx) => (
            <button 
              key={idx} 
              className={`indicator ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            ></button>
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
