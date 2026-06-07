import { Star, MessageSquare, Coffee, Car, BellRing, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const serviceIcons = {
  'Room Service': Coffee,
  Housekeeping: BellRing,
  Transportation: Car,
  'Wake-up Call': BellRing,
  Laundry: Coffee,
  Spa: Coffee,
};

const Feedback = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fbRes, srRes] = await Promise.all([
        api.feedback.getFeedbacks(),
        api.feedback.getServices()
      ]);
      if (fbRes?.data?.feedbacks) setFeedbackData(fbRes.data.feedbacks);
      if (srRes?.data?.requests) setServiceRequests(srRes.data.requests);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateServiceStatus = async (id, status) => {
    try {
      await api.feedback.updateServiceStatus(id, status);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours || 1} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Feedback & Guest Services</h1>
          <p className="page-subtitle">Monitor guest satisfaction and manage service requests.</p>
        </div>
      </div>

      {loading && <p style={{ marginTop: '24px', color: 'var(--color-text-muted)' }}>Loading...</p>}

      <div className="feedback-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', marginTop: '24px' }}>
        <div className="left-column flex-col gap-6">
          <section className="service-requests">
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} style={{ color: 'var(--color-primary)' }} /> Active Service Requests
            </h3>
            {serviceRequests.length === 0 && !loading && (
              <p style={{ color: 'var(--color-text-muted)', padding: '16px' }}>No service requests yet.</p>
            )}
            <div className="grid grid-cols-1 gap-4">
              {serviceRequests.map((req) => {
                const Icon = serviceIcons[req.serviceType] || Coffee;
                return (
                  <div key={req._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600' }}>Room {req.roomNumber}</span>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>• {req.guestName}</span>
                        </div>
                        <p style={{ fontSize: '14px', margin: '4px 0' }}>{req.serviceType}: <span className="text-muted">{req.details}</span></p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${req.status === 'Pending' ? 'badge-warning' : req.status === 'In Progress' ? 'badge-info' : 'badge-success'}`} style={{ marginBottom: '8px' }}>
                        {req.status}
                      </span>
                      <br />
                      {req.status === 'Pending' && (
                        <button className="btn-text" style={{ fontSize: '12px' }} onClick={() => handleUpdateServiceStatus(req._id, 'In Progress')}>Start</button>
                      )}
                      {req.status === 'In Progress' && (
                        <button className="btn-text" style={{ fontSize: '12px' }} onClick={() => handleUpdateServiceStatus(req._id, 'Completed')}>Complete</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="right-column">
          <section className="guest-feedback">
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={20} style={{ color: 'var(--color-primary)' }} /> Recent Feedback
            </h3>
            {feedbackData.length === 0 && !loading && (
              <p style={{ color: 'var(--color-text-muted)', padding: '16px' }}>No guest feedback yet.</p>
            )}
            <div className="flex-col gap-4">
              {feedbackData.map((fb) => (
                <div key={fb._id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{fb.guestName}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{formatDate(fb.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < fb.rating ? 'var(--color-primary)' : 'none'} stroke={i < fb.rating ? 'var(--color-primary)' : 'var(--color-border)'} />
                    ))}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>"{fb.comment}"</p>
                  <div style={{ marginTop: '8px' }}>
                    <span className="badge badge-info">{fb.category}</span>
                    <span className="badge badge-warning" style={{ marginLeft: '8px' }}>{fb.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
