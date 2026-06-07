import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeroSection from '../../components/public/HeroSection';
import { api } from '../../utils/api';
import { getToken } from '../../utils/auth';
import './Wellness.css';

const journeySteps = [
  { step: '01', title: 'Arrival Ritual', desc: 'Begin with a warm herbal welcome drink and our signature foot cleanse as you transition into serenity.', img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80' },
  { step: '02', title: 'The Thermal Journey', desc: 'Move through our three thermal pools — cold plunge, warm hydrotherapy, and heated mineral bath.', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
  { step: '03', title: 'Signature Treatment', desc: 'Choose from our bespoke menu of massages, facials, and body rituals designed by award-winning therapists.', img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80' },
  { step: '04', title: 'Mindful Restoration', desc: 'Conclude in our tranquility lounge with guided breathwork and a curated wellness journal to take home.', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80' },
  { step: '05', title: 'Herbal Nutrition Bar', desc: 'Nourish from within at our wellness bar, offering cold-pressed juices, adaptogen elixirs, and seasonal superfoods.', img: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=80' },
  { step: '06', title: 'Evening Wind-Down', desc: 'End your day with a private candlelit soak, essential oil diffusion, and our signature sleep-enhancing pillow mist.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80' },
];

const Wellness = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPackages, setShowPackages] = useState(false);

  const handleReserve = (pkg) => {
    if (getToken()) {
      navigate('/guest/services', { state: { spaPackage: pkg } });
      return;
    }
    navigate('/contact', { state: { spaPackage: `${pkg.name} ($${pkg.price})` } });
  };

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const res = await api.wellness.getAll(true);
        const list = res?.data?.packages || [];
        setPackages(list);
        if (list.length > 0) setShowPackages(true);
      } catch (err) {
        console.error('Failed to load wellness packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <div className="wellness-page">
      <HeroSection
        title="Spa & Wellness"
        tagline="Where stillness becomes your greatest luxury."
        backgroundImage="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80"
      />

      <section className="journey-section">
        <div className="journey-header container">
          <span className="wellness-label">The Experience</span>
          <h2>Your Spa Journey</h2>
          <p>A curated sequence of rituals designed to guide you from arrival to total restoration.</p>
        </div>
        <div className="journey-track">
          {journeySteps.map((s, i) => (
            <div key={i} className="journey-card">
              <div className="journey-img-wrap">
                <img src={s.img} alt={s.title} />
                <div className="journey-img-overlay"></div>
                <div className="journey-step-num">{s.step}</div>
              </div>
              <div className="journey-card-body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="journey-scroll-hint">← Scroll to explore the journey →</div>
      </section>

      <section className="packages-section" id="packages">
        <div className="container">
          <div className="packages-intro">
            <span className="wellness-label">Curated Experiences</span>
            <h2>Reserve Your Wellness Journey</h2>
            <p>All packages include thermal access, a signature treatment, and the tranquility lounge.</p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => setShowPackages(!showPackages)}
            >
              {showPackages ? 'Hide Packages ↑' : 'View Packages ↓'}
            </button>
          </div>

          {showPackages && (
            <>
              {loading && (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px' }}>
                  Loading packages...
                </p>
              )}
              {!loading && packages.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px' }}>
                  No wellness packages available at the moment.
                </p>
              )}
              {!loading && packages.length > 0 && (
                <div className="packages-grid">
                  {packages.map((pkg) => (
                    <div
                      key={pkg._id}
                      className={`package-card ${pkg.featured || pkg.badge === 'Most Popular' ? 'featured' : ''}`}
                    >
                      {pkg.badge && <span className="pkg-badge">{pkg.badge}</span>}
                      <div className="pkg-top" style={{ borderTop: `4px solid ${pkg.color || '#8B7355'}` }}>
                        <h3 className="pkg-name">{pkg.name}</h3>
                        <span className="pkg-duration">{pkg.duration}</span>
                        <div className="pkg-price">
                          ${pkg.price}
                          <span>/person</span>
                        </div>
                      </div>
                      <ul className="pkg-features">
                        {(pkg.features || []).map((f, j) => (
                          <li key={j}>
                            <span className="pkg-check">✦</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 'auto' }}
                        onClick={() => handleReserve(pkg)}
                      >
                        Reserve Now
                      </button>
                      {!getToken() && (
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px', textAlign: 'center' }}>
                          <Link to="/login">Sign in</Link> as guest to book & add to your bill
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Wellness;
