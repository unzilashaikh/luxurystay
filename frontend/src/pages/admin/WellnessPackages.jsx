import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Star } from 'lucide-react';
import { api } from '../../utils/api';

const emptyForm = { name: '', duration: '', price: '', badge: '', featured: false, features: [''] };

const WellnessPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await api.wellness.getAll();
      setPackages(res?.data?.packages || []);
    } catch (err) {
      console.error('Failed to load wellness packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (pkg) => {
    setForm({
      name: pkg.name,
      duration: pkg.duration,
      price: String(pkg.price),
      badge: pkg.badge || '',
      featured: pkg.featured,
      features: pkg.features?.length ? [...pkg.features] : [''],
    });
    setEditId(pkg._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleFeatureChange = (i, val) => {
    const f = [...form.features];
    f[i] = val;
    setForm({ ...form, features: f });
  };

  const addFeature = () => setForm({ ...form, features: [...form.features, ''] });
  const removeFeature = (i) =>
    setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) });

  const handleSave = async () => {
    if (!form.name || !form.price || !form.duration) return;
    const cleanFeatures = form.features.filter((f) => f.trim());
    const payload = {
      name: form.name,
      duration: form.duration,
      price: Number(form.price),
      badge: form.badge,
      featured: form.featured,
      features: cleanFeatures,
    };

    setSaving(true);
    try {
      if (editId) {
        await api.wellness.update(editId, payload);
      } else {
        await api.wellness.create(payload);
      }
      await fetchPackages();
      closeModal();
    } catch (err) {
      alert(err.message || 'Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.wellness.delete(id);
      await fetchPackages();
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete package');
    }
  };

  return (
    <div className="rooms-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Wellness Packages</h1>
          <p className="page-subtitle">Manage spa packages displayed on the public Wellness page.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            <Plus size={18} style={{ marginRight: '8px' }} /> Add Package
          </button>
        </div>
      </div>

      {loading && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '48px' }}>
          Loading packages...
        </p>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {packages.length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '48px' }}>
              No wellness packages yet. Add a package — it will appear on the public /wellness page.
            </p>
          )}
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="card"
              style={{
                padding: '28px',
                position: 'relative',
                borderTop: `4px solid ${pkg.featured ? 'var(--accent-gold)' : 'var(--border-color)'}`,
              }}
            >
              {pkg.featured && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '24px',
                    background: 'var(--accent-gold)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    padding: '4px 14px',
                    borderRadius: '20px',
                  }}
                >
                  ⭐ Featured
                </span>
              )}
              {pkg.badge && (
                <span className="badge badge-warning" style={{ marginBottom: '10px', display: 'inline-block' }}>
                  {pkg.badge}
                </span>
              )}
              <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{pkg.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{pkg.duration}</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '16px' }}>
                ${pkg.price}
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 400 }}>/person</span>
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: '13px' }}>
                {(pkg.features || []).map((f, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '6px 0',
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      gap: '8px',
                    }}
                  >
                    <Check size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: '2px' }} /> {f}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => openEdit(pkg)}>
                  <Pencil size={14} style={{ marginRight: '6px' }} /> Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, color: '#e74c3c', borderColor: '#e74c3c' }}
                  onClick={() => setDeleteId(pkg._id)}
                >
                  <Trash2 size={14} style={{ marginRight: '6px' }} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '40px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
              border: '1px solid var(--color-border)',
              background: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {editId ? 'Edit Wellness Package' : 'Create New Package'}
              </h2>
              <button type="button" className="icon-btn" onClick={closeModal} style={{ background: '#f5f5f5', borderRadius: '50%', padding: '8px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Package Name *</label>
                <input className="input-field" placeholder="e.g. The Serenity Escape" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Duration *</label>
                  <input className="input-field" placeholder="e.g. Half Day · 4 hrs" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                </div>
                <div>
                  <label className="input-label">Price ($/person) *</label>
                  <input className="input-field" type="number" placeholder="e.g. 280" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="input-label">Badge Label (optional)</label>
                <input className="input-field" placeholder="e.g. Most Popular, Premium" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)' }}
                />
                <label htmlFor="featured" className="input-label" style={{ margin: 0, cursor: 'pointer' }}>
                  <Star size={14} style={{ marginRight: '4px', color: 'var(--accent-gold)' }} /> Mark as Featured (highlighted card)
                </label>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label className="input-label" style={{ margin: 0 }}>Features / Inclusions</label>
                  <button type="button" className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={addFeature}>
                    + Add
                  </button>
                </div>
                {form.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      className="input-field"
                      placeholder={`Feature ${i + 1}`}
                      value={f}
                      onChange={(e) => handleFeatureChange(i, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="button" className="icon-btn" onClick={() => removeFeature(i)} disabled={form.features.length === 1}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Package'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="card" style={{ padding: '36px', maxWidth: '420px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
            <h3 style={{ marginBottom: '10px' }}>Delete this package?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
              This action cannot be undone. The package will be removed from the public page.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, background: '#e74c3c', borderColor: '#e74c3c' }}
                onClick={() => handleDelete(deleteId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessPackages;
