import { useState } from 'react';
import { Star } from 'lucide-react';
import { useGuest } from '../../context/GuestContext';
import { api } from '../../utils/api';

const GuestFeedback = () => {
  const { user } = useGuest();
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Overall');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!comment.trim()) {
      setError('Please write your feedback.');
      return;
    }

    setSubmitting(true);
    try {
      await api.feedback.createFeedback({
        guestName: user?.name || 'Guest',
        guestEmail: user?.email || '',
        rating,
        comment: comment.trim(),
        category,
      });
      setSuccess('Thank you! Your feedback was sent to our team.');
      setComment('');
      setRating(5);
    } catch (err) {
      setError(err.message || 'Could not submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Feedback</h1>
          <p className="page-subtitle">
            Share your experience — saved to our system and visible to admin & reception.
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '560px', padding: '28px' }}>
        {success && (
          <p style={{ color: 'var(--color-success)', marginBottom: '16px', fontSize: '14px' }}>{success}</p>
        )}
        {error && (
          <p style={{ color: 'var(--color-danger)', marginBottom: '16px', fontSize: '14px' }}>{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="input-label">Rating</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: n <= rating ? 'var(--color-primary)' : '#ccc',
                }}
                aria-label={`${n} stars`}
              >
                <Star size={28} fill={n <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>

          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label className="input-label">Category</label>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {['Overall', 'Rooms', 'Service', 'Dining', 'Wellness'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label className="input-label">Your feedback</label>
            <textarea
              className="input-field"
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your stay..."
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Sending...' : 'Submit feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuestFeedback;
