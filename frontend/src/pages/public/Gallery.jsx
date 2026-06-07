import { useEffect, useRef, useState } from 'react';
import { api } from '../../utils/api';
import './Gallery.css';

const FALLBACK = [
  {
    url: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=1200',
    size: 'large',
    cat: 'Dining',
  },
  {
    url: 'https://images.pexels.com/photos/6663571/pexels-photo-6663571.jpeg?auto=compress&cs=tinysrgb&w=1200',
    size: 'medium',
    cat: 'Wellness & Spa',
  },
];

const sizes = ['small', 'medium', 'large', 'medium', 'small'];

const roomToGallery = (room, index) => ({
  url:
    room.images?.[0] ||
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200',
  size: sizes[index % sizes.length],
  cat: room.type?.includes('Suite') ? 'Suites' : 'Rooms',
  label: `Room ${room.number}`,
});

const Gallery = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const masonryRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.rooms.getAll();
        const rooms = res?.data?.rooms || [];
        const fromRooms = rooms.flatMap((room, i) => {
          const imgs = room.images?.length
            ? room.images.map((url, j) => ({
                url,
                size: sizes[(i + j) % sizes.length],
                cat: room.type?.includes('Suite') ? 'Suites' : 'Rooms',
                label: `Room ${room.number}`,
              }))
            : [roomToGallery(room, i)];
          return imgs;
        });
        setImages([...fromRooms, ...FALLBACK]);
      } catch {
        setImages(FALLBACK);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const items = masonryRef.current?.querySelectorAll('.masonry-item');
    items?.forEach((item, index) => {
      item.classList.remove('visible');
      setTimeout(() => {
        item.classList.add('visible');
      }, index * 100);
    });
  }, [activeFilter, images]);

  const handleMouseMove = (e) => {
    const item = e.currentTarget;
    const { left, top, width, height } = item.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    item.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-10px)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0)`;
  };

  const filteredImages =
    activeFilter === 'All'
      ? images
      : images.filter(
          (img) =>
            img.cat === activeFilter ||
            (activeFilter === 'Accommodations' && (img.cat === 'Suites' || img.cat === 'Rooms'))
        );

  return (
    <div className="gallery-page-light">
      <div className="gallery-bg-glow"></div>

      {selectedImg && (
        <div className="lightbox-overlay" onClick={() => setSelectedImg(null)}>
          <button type="button" className="lightbox-close">
            &times;
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImg.url} alt="Preview" />
            <div className="lightbox-caption">
              {selectedImg.label || selectedImg.cat} Collection
            </div>
          </div>
        </div>
      )}

      <header className="gallery-header container">
        <div className="reveal-text">
          <span className="gallery-pretitle">The Visual Collection</span>
        </div>
        <h1 className="gallery-main-title">Moments of Pure Elegance</h1>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          {loading ? 'Loading from property...' : 'Room photos from our database + curated highlights'}
        </p>
        <div className="gallery-filters">
          {['All', 'Accommodations', 'Dining', 'Wellness & Spa'].map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      <section className="masonry-gallery container" ref={masonryRef}>
        {filteredImages.map((img, index) => (
          <div
            key={`${img.url}-${index}`}
            className={`masonry-item ${img.size}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => setSelectedImg(img)}
          >
            <div className="masonry-inner">
              <img src={img.url} alt={img.label || img.cat} />
              <div className="masonry-overlay">
                <span className="masonry-cat">{img.label || img.cat}</span>
                <div className="masonry-line"></div>
                <button type="button" className="masonry-view">
                  Open Preview ↗
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="gallery-ticker">
        <div className="ticker-wrapper">
          <div className="ticker-content">
            <span>Unrivaled Elegance</span>
            <span className="ticker-dot"></span>
            <span>Timeless Luxury</span>
            <span className="ticker-dot"></span>
            <span>Bespoke Service</span>
            <span className="ticker-dot"></span>
            <span>Pure Comfort</span>
            <span className="ticker-dot"></span>
            <span>Unrivaled Elegance</span>
            <span className="ticker-dot"></span>
            <span>Timeless Luxury</span>
            <span className="ticker-dot"></span>
            <span>Bespoke Service</span>
            <span className="ticker-dot"></span>
            <span>Pure Comfort</span>
            <span className="ticker-dot"></span>
          </div>
        </div>
      </section>

      <section className="gallery-footer-cta">
        <div className="container">
          <div className="cta-content-minimal">
            <h2>Ready to experience this?</h2>
            <p>Book a room from our live inventory.</p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => {
                window.location.href = '/?book=1';
              }}
            >
              Book Your Journey
            </button>
            <span className="gallery-crest">L</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
