import { useState } from 'react';
import HeroSection from '../../components/public/HeroSection';
import SplitDetailSection from '../../components/public/SplitDetailSection';
import CtaBanner from '../../components/public/CtaBanner';
import './LandingPage.css';

const todayStr = () => new Date().toISOString().slice(0, 10);
const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const LandingPage = () => {
  const [checkIn, setCheckIn] = useState(todayStr());
  const [checkOut, setCheckOut] = useState(addDays(5));
  const heroSlides = [
    {
      title: <>Experience Unrivaled <br/>Luxury & Elegance</>,
      tagline: "Welcome to a world of refined hospitality. Discover our exclusive collection of luxury properties.",
      backgroundImage: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2"
    },
    {
      title: <>Elegance in <br/>Every Detail</>,
      tagline: "Bespoke service tailored to your most refined desires.",
      backgroundImage: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2"
    },
    {
      title: <>Your Private <br/>Sanctuary</>,
      tagline: "Discover a world of tranquility and sophisticated comfort.",
      backgroundImage: "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2",
      videoUrl: "https://player.vimeo.com/external/363836335.hd.mp4?s=7b9a22f9645281699990e72f8832a768d877e68e&profile_id=175"
    }
  ];

  return (
    <div className="page-wrapper">
      <HeroSection slides={heroSlides} />

      <section className="container" style={{ marginTop: '-45px', position: 'relative', zIndex: 20 }}>
        <div className="luxury-booking-pill">
          <div className="pill-item">
            <i className="far fa-calendar-alt pill-icon"></i>
            <div className="pill-content">
              <label>Arrival</label>
              <input
                type="date"
                className="pill-input"
                min={todayStr()}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
          </div>
          <div className="pill-divider"></div>
          <div className="pill-item">
            <i className="far fa-calendar-check pill-icon"></i>
            <div className="pill-content">
              <label>Departure</label>
              <input
                type="date"
                className="pill-input"
                min={checkIn || todayStr()}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>
          <div className="pill-divider"></div>
          <div className="pill-item">
            <i className="fas fa-user-friends pill-icon"></i>
            <div className="pill-content">
              <label>Guests</label>
              <select className="pill-input">
                <option>2 Adults, 1 Room</option>
                <option>1 Adult, 1 Room</option>
                <option>2 Adults, 2 Children</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            className="pill-button"
            onClick={() => {
              const q = new URLSearchParams({
                book: '1',
                checkIn,
                checkOut,
              });
              window.location.href = `/?${q.toString()}`;
            }}
          >
            Check Availability
          </button>
        </div>
      </section>

      <SplitDetailSection 
        image="https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        title="The Art of Hospitality"
        subtitle="Our Philosophy"
        description="At LuxuryStay, we believe that true luxury lies in the details. From the moment you arrive, our dedicated team is committed to anticipating your needs and exceeding your expectations, ensuring a stay that is truly unforgettable."
      />

      <CtaBanner 
        title="Begin your journey."
        subtitle="Explore our global collection of award-winning hotels and resorts."
        buttonText="Discover Destinations"
        buttonLink="/our-hotels"
      />

      {/* Decorative Background Elements */}
      <div className="bg-decoration-glow glow-1"></div>
      <div className="bg-decoration-glow glow-2"></div>
    </div>
  );
};

export default LandingPage;
