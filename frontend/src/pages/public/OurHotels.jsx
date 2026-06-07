import { useEffect, useState } from 'react';
import HeroSection from '../../components/public/HeroSection';
import ContentCard from '../../components/public/ContentCard';
import SplitDetailSection from '../../components/public/SplitDetailSection';
import CtaBanner from '../../components/public/CtaBanner';
import { api } from '../../utils/api';
import { pickTypeGroupImage } from '../../utils/roomTypeImages';

const OurHotels = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.rooms.getAll();
        setRooms(res?.data?.rooms || []);
      } catch {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const byType = rooms.reduce((acc, room) => {
    if (!acc[room.type]) acc[room.type] = [];
    acc[room.type].push(room);
    return acc;
  }, {});

  const typeCards = Object.entries(byType).map(([type, list]) => {
    const sample = list.find((r) => r.status === 'Available') || list[0];
    const minPrice = Math.min(...list.map((r) => r.price));
    const availableCount = list.filter((r) => r.status === 'Available').length;
    return {
      type,
      count: list.length,
      image: pickTypeGroupImage(list, type),
      minPrice,
      availableCount,
      features:
        sample?.amenities?.slice(0, 3) ||
        [
          `${list.length} room${list.length !== 1 ? 's' : ''} in this category`,
          sample?.floor || 'Multiple floors',
          availableCount > 0 ? `${availableCount} available now` : 'Check availability',
        ],
      linkTo: `/?book=1&room=${sample?._id || ''}`,
      badge: availableCount > 0 ? 'Available' : sample?.status,
    };
  });

  return (
    <div className="page-wrapper">
      <HeroSection
        title="Our Accommodations"
        tagline="Every suite and room listed here comes from our live property inventory."
        backgroundImage="https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
      />

      <section className="page-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Room categories</h2>
            <p className="section-subtitle">
              Browse by type — availability and pricing sync with admin and reception.
            </p>
          </div>

          {loading && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading accommodations...</p>
          )}

          {!loading && typeCards.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Rooms will appear here once added in the admin panel.
            </p>
          )}

          <div className="staggered-grid">
            {typeCards.map((card) => (
              <div key={card.type} className="stagger-item">
                <ContentCard
                  image={card.image}
                  title={card.type}
                  subtitle={`${card.count} room${card.count !== 1 ? 's' : ''} · Luxury Stay`}
                  features={card.features}
                  linkTo={card.linkTo}
                  linkText="Book now"
                  price={card.minPrice}
                  badge={card.badge}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="immersive-panorama">
        <div className="panorama-overlay"></div>
        <img
          src="https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2"
          alt="Signature Experience"
          className="panorama-img"
        />
        <div className="panorama-content container">
          <span className="panorama-badge">The Signature Collection</span>
          <h2>
            Where Every Stay <br />
            Becomes a Legacy
          </h2>
          <p>
            Beyond exceptional service lies our commitment to moments that stay with you — book from
            real rooms, managed by our team in admin and reception portals.
          </p>
        </div>
      </section>

      <SplitDetailSection
        image="https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        title="Managed in Real Time"
        subtitle="Connected System"
        description="When you reserve on our website, your booking appears instantly for receptionists and administrators — no duplicate spreadsheets or lost requests."
      />

      <CtaBanner
        title="Ready to stay?"
        subtitle="View all rooms or open the reservation form."
        buttonText="View Rooms"
        buttonLink="/rooms"
      />
    </div>
  );
};

export default OurHotels;
