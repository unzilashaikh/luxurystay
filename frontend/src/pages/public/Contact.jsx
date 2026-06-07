import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../../components/public/HeroSection';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { api } from '../../utils/api';

const SUBJECT_TO_CATEGORY = {
  'General Inquiry': 'Overall',
  'Reservation Support': 'Service',
  'Event Planning': 'Service',
  Feedback: 'Overall',
  'Spa & Wellness': 'Wellness',
};

const Contact = () => {
  const location = useLocation();
  const spaPrefill = location.state?.spaPackage || new URLSearchParams(location.search).get('spa') || '';

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: spaPrefill ? 'Spa & Wellness' : 'General Inquiry',
    message: spaPrefill ? `I would like to reserve: ${spaPrefill}` : '',
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const guestName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    if (!guestName || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setSubmitting(true);
    try {
      await api.feedback.createFeedback({
        guestName,
        guestEmail: form.email.trim(),
        rating: Number(form.rating) || 5,
        comment: `[${form.subject}] ${form.message.trim()}`,
        category: SUBJECT_TO_CATEGORY[form.subject] || 'Overall',
      });
      setSuccess('Message sent! Our concierge team will respond shortly.');
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
        rating: 5,
      });
    } catch (err) {
      setError(err.message || 'Could not send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <HeroSection
        title="Get in Touch"
        tagline="Our dedicated concierge team is available 24/7 to assist with your inquiries and reservations."
        backgroundImage="https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=2000&q=80"
      />

      <section className="page-section container">
        <div className="grid grid-cols-2 gap-12">
          <div className="contact-info">
            <h2 className="section-title" style={{ textAlign: 'left' }}>
              Contact Information
            </h2>
            <p className="section-subtitle" style={{ textAlign: 'left', marginLeft: 0 }}>
              Reach out through any channel — messages from this form are saved and handled by our team.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '40px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    padding: '12px',
                    borderRadius: '12px',
                    color: 'var(--color-primary)',
                  }}
                >
                  <Phone size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>Phone</h4>
                  <p className="text-muted">General: +1 (800) 123-LUXE</p>
                  <p className="text-muted">Reservations: +1 (800) 999-STAY</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    padding: '12px',
                    borderRadius: '12px',
                    color: 'var(--color-primary)',
                  }}
                >
                  <Mail size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>Email</h4>
                  <p className="text-muted">concierge@luxurystay.com</p>
                  <p className="text-muted">events@luxurystay.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    padding: '12px',
                    borderRadius: '12px',
                    color: 'var(--color-primary)',
                  }}
                >
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>Headquarters</h4>
                  <p className="text-muted">123 Prestige Blvd, Beverly Hills</p>
                  <p className="text-muted">California, 90210, USA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <div className="card" style={{ padding: '40px' }}>
              <h3 style={{ marginBottom: '24px' }}>Send us a Message</h3>

              {success && (
                <div
                  style={{
                    padding: '12px',
                    marginBottom: '16px',
                    background: '#e8f5e9',
                    color: '#2e7d32',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                >
                  {success}
                </div>
              )}
              {error && (
                <div
                  style={{
                    padding: '12px',
                    marginBottom: '16px',
                    background: '#ffebee',
                    color: '#c62828',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                >
                  {error}
                </div>
              )}

              <form className="flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">First Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Last Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Subject</label>
                  <select
                    className="input-field"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    <option>General Inquiry</option>
                    <option>Reservation Support</option>
                    <option>Spa & Wellness</option>
                    <option>Event Planning</option>
                    <option>Feedback</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Rating (optional)</label>
                  <select
                    className="input-field"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} stars
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Message</label>
                  <textarea
                    className="input-field"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help you?"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ marginTop: '12px', width: '100%', height: '50px' }}
                >
                  <Send size={18} style={{ marginRight: '8px' }} />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section
        className="map-section"
        style={{ height: '400px', backgroundColor: '#f0f0f0', position: 'relative', marginTop: '64px' }}
      >
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <MapPin size={48} color="var(--color-primary)" />
            <p className="font-serif" style={{ marginTop: '12px', fontSize: '18px' }}>
              Luxury Stay — Beverly Hills
            </p>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=2000&q=80"
          alt="Map"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
        />
      </section>
    </div>
  );
};

export default Contact;
