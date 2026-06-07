import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BookingModal from '../components/public/BookingModal';
import { api } from '../utils/api';
import Preloader from '../components/Preloader';
import CustomCursor from '../components/CustomCursor';
import WhatsAppButton from '../components/public/WhatsAppButton';
import BrandLogo from '../components/BrandLogo';
import signatureImg from '../assets/signature.png';
import './PublicLayout.css';

const PublicLayout = () => {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState({ room: '', checkIn: '', checkOut: '' });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Open booking modal from #book or ?book=1&room=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openBook = location.hash === '#book' || params.get('book') === '1';
    if (openBook) {
      setBookingPrefill({
        room: params.get('room') || '',
        checkIn: params.get('checkIn') || '',
        checkOut: params.get('checkOut') || '',
      });
      setIsBookingModalOpen(true);
      window.history.replaceState(null, '', location.pathname);
    }
  }, [location.hash, location.search, location.pathname]);

  const isLightPage = ['/gallery', '/contact'].includes(location.pathname);

  return (
    <div className="public-layout">
      <Preloader />
      <CustomCursor />
      <WhatsAppButton />
      <header className={`public-header ${scrolled || isLightPage ? 'scrolled' : ''}`}>
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
        <div className="container header-container">
          <Link to="/" className="brand">
            <BrandLogo size="lg" />
          </Link>
          <nav className="public-nav">
            <Link to="/rooms" className="nav-link">Rooms</Link>
            <Link to="/our-hotels" className="nav-link">Our Hotels</Link>
            <Link to="/residences" className="nav-link">Residences</Link>
            <Link to="/gallery" className="nav-link">Gallery</Link>
            <Link to="/dining" className="nav-link">Dining</Link>
            <Link to="/wellness" className="nav-link">Wellness</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </nav>
          <div className="header-actions">
            <Link to="/login" className="btn btn-outline staff-login-btn">Login</Link>
            <button className="btn btn-primary book-btn" onClick={() => setIsBookingModalOpen(true)}>Book Now</button>
          </div>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="footer-watermark">LuxuryStay</div>
        
        <div className="container">
          <div className="footer-top">
            <div className="footer-newsletter">
              <h2>Join the Elite Circle</h2>
              <p className="text-muted">Subscribe to receive exclusive offers and seasonal updates.</p>
              <form
                className="newsletter-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setNewsletterMsg('');
                  if (!newsletterEmail.trim()) return;
                  try {
                    await api.feedback.createFeedback({
                      guestName: 'Newsletter subscriber',
                      guestEmail: newsletterEmail.trim(),
                      rating: 5,
                      comment: `[Newsletter] Subscribe request from website footer`,
                      category: 'Overall',
                    });
                    setNewsletterMsg('Subscribed! We will be in touch.');
                    setNewsletterEmail('');
                  } catch {
                    setNewsletterMsg('Could not save — try again later.');
                  }
                }}
              >
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Your Email Address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary">
                  Subscribe
                </button>
              </form>
              {newsletterMsg && (
                <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {newsletterMsg}
                </p>
              )}
            </div>
          </div>

          <div className="footer-grid">
            <div className="footer-logo-area">
              <Link to="/" className="brand">
                <BrandLogo size="xl" className="footer-brand-logo" />
              </Link>
              <p className="footer-desc" style={{ marginTop: '24px', lineHeight: '1.8' }}>
                Defining the pinnacle of global hospitality through unparalleled service and timeless elegance.
              </p>
              <div className="footer-socials">
                <a href="https://www.instagram.com" className="social-icon"><i className="fab fa-instagram"></i></a>
                <a href="https://www.facebook.com" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                <a href="https://www.twitter.com" className="social-icon"><i className="fab fa-twitter"></i></a>
                <a href="https://www.linkedin.com" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
              </div>
              <div className="footer-signature">
                <img src={signatureImg} alt="Alexander von Luxury Signature" />
                <p className="signature-title">Alexander von Luxury, Founder & CEO</p>
              </div>
            </div>

            <div className="footer-column">
              <h4>Explore</h4>
              <ul className="footer-links">
                <li><Link to="/rooms">Rooms & Suites</Link></li>
                <li><Link to="/our-hotels">Our Hotels</Link></li>
                <li><Link to="/residences">Residences</Link></li>
                <li><Link to="/gallery">Gallery</Link></li>
                <li><Link to="/dining">Dining</Link></li>
                <li><Link to="/wellness">Wellness</Link></li>
              </ul>
            </div>


            <div className="footer-column">
              <h4>Support</h4>
              <ul className="footer-links">
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service">Terms of Service</Link></li>
                <li><Link to="/cookies-policy">Cookie Policy</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Location</h4>
              <ul className="footer-links">
                <li><span className="text-muted">Quai du Mont-Blanc 12</span></li>
                <li><span className="text-muted">1201 Genève, Switzerland</span></li>
                <li><a href="tel:+41227316500">+41 22 731 65 00</a></li>
                <li><a href="mailto:concierge@luxurystay.com">concierge@luxurystay.com</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} LuxuryStay Hospitality Group. All rights reserved.</p>
            <div className="footer-legal">
              <Link to="/privacy-policy">Privacy</Link>
              <Link to="/terms-of-service">Terms</Link>
              <Link to="/cookies-policy">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialRoomId={bookingPrefill.room}
        initialCheckIn={bookingPrefill.checkIn}
        initialCheckOut={bookingPrefill.checkOut}
      />
    </div>
  );
};

export default PublicLayout;
