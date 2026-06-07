import { useEffect, useState } from 'react';
import HeroSection from '../../components/public/HeroSection';
import ContentCard from '../../components/public/ContentCard';
import SplitDetailSection from '../../components/public/SplitDetailSection';
import CtaBanner from '../../components/public/CtaBanner';
import { api } from '../../utils/api';
import './Residences.css';

const Residences = () => {
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inquireTarget, setInquireTarget] = useState(null);
  const [form, setForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.residences.getAll(true);
        setResidences(res?.data?.residences || []);
      } catch {
        setResidences([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openInquire = (residence) => {
    setInquireTarget(residence);
    setForm({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      message: `I am interested in ${residence.title}. Please contact me with availability and pricing.`,
    });
    setFormError('');
    setFormSuccess('');
  };

  const closeInquire = () => {
    setInquireTarget(null);
    setFormError('');
    setFormSuccess('');
  };

  const handleInquireSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    try {
      await api.residences.inquire({
        residenceId: inquireTarget?._id,
        guestName: form.guestName.trim(),
        guestEmail: form.guestEmail.trim(),
        guestPhone: form.guestPhone.trim(),
        message: form.message.trim(),
      });
      setFormSuccess('Thank you! Our residential team will reach out shortly.');
      setTimeout(closeInquire, 2200);
    } catch (err) {
      setFormError(err.message || 'Could not send inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <HeroSection
        title="Private Residences"
        tagline="Elevate your everyday life with our exclusive luxury apartments and villas."
        backgroundImage="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80"
      />

      <section className="page-section container residences-list-section">
        <div className="section-header">
          <h2 className="section-title">Available Residences</h2>
          <p className="section-subtitle">
            Listings from our database — inquiries go to admin and reception instantly.
          </p>
        </div>

        {loading && (
          <p className="residences-status">Loading residences...</p>
        )}

        {!loading && residences.length === 0 && (
          <p className="residences-status">No residences available. Check back soon.</p>
        )}

        <div className="residences-grid">
          {residences.map((r) => (
            <ContentCard
              key={r._id}
              image={r.image}
              title={r.title}
              subtitle={r.subtitle}
              features={r.features || []}
              price={r.priceFrom > 0 ? r.priceFrom : undefined}
              priceLabel="/ month from"
              linkText="Inquire now"
              onAction={() => openInquire(r)}
            />
          ))}
        </div>
      </section>

      {inquireTarget && (
        <div className="residence-inquire-overlay" onClick={closeInquire}>
          <div className="residence-inquire-modal card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="residence-inquire-close" onClick={closeInquire}>
              &times;
            </button>
            <h3>Inquire — {inquireTarget.title}</h3>
            <p className="text-muted" style={{ marginBottom: '20px', fontSize: '14px' }}>
              {inquireTarget.subtitle}
              {inquireTarget.priceFrom > 0 && ` · From $${inquireTarget.priceFrom}/month`}
            </p>

            {formSuccess && <div className="residence-alert success">{formSuccess}</div>}
            {formError && <div className="residence-alert error">{formError}</div>}

            <form onSubmit={handleInquireSubmit} className="residence-inquire-form">
              <div className="input-group">
                <label className="input-label">Full name *</label>
                <input
                  className="input-field"
                  value={form.guestName}
                  onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Email *</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.guestEmail}
                  onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input
                  className="input-field"
                  value={form.guestPhone}
                  onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Message *</label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Sending...' : 'Send inquiry'}
              </button>
            </form>
          </div>
        </div>
      )}

      <SplitDetailSection
        image="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
        title="The Ultimate Lifestyle"
        subtitle="Exclusive Amenities"
        description="Our residences are designed with the finest materials and state-of-the-art technology. Enjoy access to residents-only lounges, private fitness centers, and a dedicated team ready to cater to your every need."
        reverse
      />

      <CtaBanner
        title="Find your perfect sanctuary."
        subtitle="Schedule a private viewing with our residential team."
        buttonText="Contact Sales"
        buttonLink="/contact"
      />
    </div>
  );
};

export default Residences;
