import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../utils/api';

const emptyForm = {
  title: '',
  subtitle: '',
  image: '',
  priceFrom: '',
  features: [''],
  active: true,
  sortOrder: 0,
};

const AdminResidences = () => {
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.residences.getAll();
      setResidences(res?.data?.residences || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (r) => {
    setForm({
      title: r.title,
      subtitle: r.subtitle || '',
      image: r.image || '',
      priceFrom: String(r.priceFrom || ''),
      features: r.features?.length ? [...r.features] : [''],
      active: r.active !== false,
      sortOrder: r.sortOrder || 0,
    });
    setEditId(r._id);
    setShowModal(true);
  };

  const handleFeatureChange = (i, val) => {
    const f = [...form.features];
    f[i] = val;
    setForm({ ...form, features: f });
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      image: form.image.trim(),
      priceFrom: Number(form.priceFrom) || 0,
      features: form.features.filter((f) => f.trim()),
      active: form.active,
      sortOrder: Number(form.sortOrder) || 0,
    };

    setSaving(true);
    try {
      if (editId) await api.residences.update(editId, payload);
      else await api.residences.create(payload);
      await fetchList();
      setShowModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.residences.delete(id);
      await fetchList();
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Private Residences</h1>
          <p className="page-subtitle">Manage listings on the public Residences page. Inquiries appear in Feedback.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} style={{ marginRight: 8 }} /> Add residence
        </button>
      </div>

      {loading && <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>}

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>From</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {residences.map((r) => (
              <tr key={r._id}>
                <td style={{ fontWeight: 600 }}>{r.title}</td>
                <td>{r.subtitle || '—'}</td>
                <td>{r.priceFrom > 0 ? `$${r.priceFrom}/mo` : '—'}</td>
                <td>
                  <span className={`badge ${r.active ? 'badge-success' : 'badge-warning'}`}>
                    {r.active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <button type="button" className="icon-btn" onClick={() => openEdit(r)} title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => setDeleteId(r._id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && residences.length === 0 && (
          <p style={{ padding: '24px', color: 'var(--color-text-muted)' }}>No residences yet.</p>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, padding: 24, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>{editId ? 'Edit residence' : 'Add residence'}</h2>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="input-field" placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input className="input-field" placeholder="Subtitle (e.g. City Center)" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: 6 }}>
                  Image URL
                </label>
                <input
                  className="input-field"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
                <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
                  Paste a full web link (https://…). It will show on the Residences card. Unsplash / Pexels links work well.
                </p>
                {form.image.trim().match(/^https?:\/\//i) && (
                  <div
                    style={{
                      marginTop: 12,
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: '1px solid var(--color-border)',
                      maxHeight: 160,
                    }}
                  >
                    <img
                      src={form.image.trim()}
                      alt="Preview"
                      style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <input className="input-field" type="number" placeholder="Price from ($/month)" value={form.priceFrom} onChange={(e) => setForm({ ...form, priceFrom: e.target.value })} />
              <label style={{ fontSize: 14 }}>Features</label>
              {form.features.map((f, i) => (
                <input key={i} className="input-field" value={f} onChange={(e) => handleFeatureChange(i, e.target.value)} placeholder={`Feature ${i + 1}`} />
              ))}
              <button type="button" className="btn btn-outline" onClick={() => setForm({ ...form, features: [...form.features, ''] })}>
                + Add feature
              </button>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Show on public website
              </label>
            </div>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div className="card" style={{ padding: 24, maxWidth: 400 }}>
            <p>Delete this residence listing?</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" style={{ background: 'var(--color-danger)' }} onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResidences;
