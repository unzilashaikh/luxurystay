import { Package, AlertCircle, Plus, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../utils/api';
import { getStockStatus } from '../../utils/housekeepingUtils';

const EMPTY_FORM = {
  name: '',
  category: 'Cleaning',
  quantity: '',
  unit: 'units',
  minLevel: '',
};

const SupplyInventoryView = ({ isAdmin = false }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.inventory.getAll();
      setItems(res?.data?.items || []);
    } catch (err) {
      setError(err.message || 'Could not load inventory.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      category: item.category || 'Cleaning',
      quantity: String(item.quantity ?? ''),
      unit: item.unit || 'units',
      minLevel: String(item.minLevel ?? ''),
    });
    setSaveError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setSaveError('');
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setSaveError('Item name is required.');
      return;
    }
    const quantity = Number(form.quantity);
    const minLevel = Number(form.minLevel);
    if (Number.isNaN(quantity) || quantity < 0) {
      setSaveError('Enter a valid quantity.');
      return;
    }
    if (Number.isNaN(minLevel) || minLevel < 0) {
      setSaveError('Enter a valid minimum level.');
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        quantity,
        unit: form.unit.trim() || 'units',
        minLevel,
      };
      if (editingItem) {
        await api.inventory.updateItem(editingItem._id, payload);
      } else {
        await api.inventory.createItem(payload);
      }
      await loadItems();
      closeModal();
    } catch (err) {
      setSaveError(err.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}" from inventory?`)) return;
    setBusyId(item._id);
    try {
      await api.inventory.deleteItem(item._id);
      await loadItems();
    } catch (err) {
      alert(err.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleRequest = async (item) => {
    const qty = window.prompt(
      `How many ${item.unit} of "${item.name}" do you need?`,
      String(Math.max(item.minLevel - item.quantity, 10))
    );
    if (qty === null) return;
    setBusyId(item._id);
    try {
      await api.inventory.requestRestock(item._id, { quantityNeeded: qty });
      await loadItems();
      alert('Restock request sent to administration.');
    } catch (err) {
      alert(err.message || 'Request failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleClearRequest = async (item) => {
    if (!window.confirm(`Mark restock request for "${item.name}" as fulfilled?`)) return;
    setBusyId(item._id);
    try {
      await api.inventory.clearRestockRequest(item._id);
      await loadItems();
    } catch (err) {
      alert(err.message || 'Failed to clear request');
    } finally {
      setBusyId(null);
    }
  };

  const lowCount = items.filter((i) => getStockStatus(i) !== 'OK').length;
  const pendingRequests = items.filter((i) => i.restockRequested).length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cleaning Supplies Inventory</h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'Add and manage supply items — only items you create appear here.'
              : 'Stock added by admin — request restock when running low.'}
          </p>
        </div>
        {isAdmin && (
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            <Plus size={18} style={{ marginRight: '8px' }} /> Add Item
          </button>
        )}
      </div>

      {error && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            padding: '14px',
            background: '#ffebee',
            color: 'var(--color-danger)',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <div
        className="stats-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}
      >
        <div className="card">
          <span className="text-muted" style={{ fontSize: '12px' }}>Total Items</span>
          <h2 style={{ margin: '4px 0' }}>{items.length}</h2>
        </div>
        <div className="card">
          <span className="text-muted" style={{ fontSize: '12px' }}>Low / Critical</span>
          <h2 style={{ margin: '4px 0', color: lowCount ? 'var(--color-danger)' : 'inherit' }}>{lowCount}</h2>
        </div>
        <div className="card">
          <span className="text-muted" style={{ fontSize: '12px' }}>Pending Requests</span>
          <h2 style={{ margin: '4px 0' }}>{pendingRequests}</h2>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>In Stock</th>
                <th>Min Level</th>
                <th>Status</th>
                {isAdmin && <th>Requested By</th>}
                <th>Request Note</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading inventory...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    {isAdmin ? 'No items yet. Click Add Item to create one.' : 'No supply items in database.'}
                  </td>
                </tr>
              )}
              {items.map((item) => {
                const status = getStockStatus(item);
                return (
                  <tr key={item._id}>
                    <td style={{ fontWeight: 600 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={16} />
                        {item.name}
                      </span>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      {item.quantity} {item.unit}
                    </td>
                    <td>{item.minLevel}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                        {item.restockRequested ? (
                          <span className="badge badge-info">Requested</span>
                        ) : status === 'Low' ? (
                          <span className="badge badge-warning">Low stock</span>
                        ) : status === 'Critical' ? (
                          <span className="badge badge-danger">Critical</span>
                        ) : (
                          <span className="badge badge-success">In stock</span>
                        )}
                      </div>
                    </td>
                    {isAdmin && (
                      <td style={{ fontSize: '13px' }}>{item.restockRequested ? item.requestedByName || '—' : '—'}</td>
                    )}
                    <td style={{ fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '200px' }}>
                      {item.restockRequested ? item.restockNote || 'Pending' : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {isAdmin ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                              disabled={busyId === item._id}
                              onClick={() => openEdit(item)}
                            >
                              Edit
                            </button>
                            {item.restockRequested && (
                              <button
                                type="button"
                                className="btn btn-primary"
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                                disabled={busyId === item._id}
                                onClick={() => handleClearRequest(item)}
                              >
                                Mark Fulfilled
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                              disabled={busyId === item._id}
                              onClick={() => handleDelete(item)}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '4px 12px', fontSize: '12px' }}
                            disabled={busyId === item._id || item.restockRequested}
                            onClick={() => handleRequest(item)}
                          >
                            {item.restockRequested ? 'Requested' : 'Request Restock'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {lowCount > 0 && (
        <p
          style={{
            marginTop: '16px',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertCircle size={14} />
          {lowCount} item(s) below minimum level
          {isAdmin ? ' — edit stock or min level.' : ' — request restock when needed.'}
        </p>
      )}

      {showModal && isAdmin && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '28px', position: 'relative' }}>
            <button
              type="button"
              onClick={closeModal}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '8px', color: 'var(--color-primary)' }}>
              {editingItem ? 'Edit Supply Item' : 'Add Supply Item'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Saved to database — visible to housekeeping staff.
            </p>

            {saveError && (
              <div style={{ padding: '10px', marginBottom: '16px', background: '#ffebee', color: 'var(--color-danger)', borderRadius: '6px', fontSize: '14px' }}>
                {saveError}
              </div>
            )}

            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Item name *</label>
                <input
                  className="input-field"
                  style={{ width: '100%' }}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Vacuum Bags"
                  required
                />
              </div>
              <div>
                <label className="input-label">Category</label>
                <select
                  className="input-field"
                  style={{ width: '100%' }}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option>Cleaning</option>
                  <option>Linens</option>
                  <option>Amenities</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">In stock (qty) *</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    style={{ width: '100%' }}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Unit</label>
                  <input
                    className="input-field"
                    style={{ width: '100%' }}
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="bottles, rolls, pieces..."
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Minimum level (alert when below) *</label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  style={{ width: '100%' }}
                  value={form.minLevel}
                  onChange={(e) => setForm({ ...form, minLevel: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyInventoryView;
