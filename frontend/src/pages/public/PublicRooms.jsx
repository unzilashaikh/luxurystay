import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../../components/public/HeroSection';
import ContentCard from '../../components/public/ContentCard';
import { api } from '../../utils/api';
import { pickRoomImage } from '../../utils/roomTypeImages';
import './PublicRooms.css';

const PublicRooms = () => {
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

  return (
    <div className="page-wrapper">
      <HeroSection
        title="Rooms & Suites"
        tagline="Live inventory from our property — book directly or request a stay."
        backgroundImage="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=2000&q=80"
      />

      <section className="page-section container public-rooms-section">
        {loading && (
          <p className="public-rooms-status">Loading rooms...</p>
        )}
        {!loading && rooms.length === 0 && (
          <p className="public-rooms-status">
            No rooms listed yet. Check back soon or <Link to="/contact">contact us</Link>.
          </p>
        )}

        <div className="public-rooms-grid">
          {rooms.map((room) => {
            const available = room.status === 'Available';
            return (
              <ContentCard
                key={room._id}
                image={pickRoomImage(room)}
                title={`Room ${room.number}`}
                subtitle={`${room.type} · ${room.floor}`}
                features={room.amenities?.slice(0, 4) || [room.type]}
                price={room.price}
                badge={room.status}
                linkTo={available ? `/?book=1&room=${room._id}` : '/contact'}
                linkText={available ? 'Book this room' : 'Contact us'}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PublicRooms;
