import { Filter, Plus, MoreVertical, X, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './Rooms.css';

const Rooms = () => {
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [floorFilter, setFloorFilter] = useState('All Floors');

  const [editRoom, setEditRoom] = useState(null);
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.rooms.getAll();
      if (res && res.data && res.data.rooms) {
        setRoomsData(res.data.rooms);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = roomsData.filter(room => {
    const matchesType = typeFilter === 'All Types' || room.type.toLowerCase().includes(typeFilter.replace('All ', '').replace('s', '').toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || room.status === statusFilter;
    const matchesFloor = floorFilter === 'All Floors' || room.floor === floorFilter;
    return matchesType && matchesStatus && matchesFloor;
  });

  const [form, setForm] = useState({ number: '', type: 'Deluxe King', status: 'Available', floor: '1st Floor', price: '' });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Available': return 'badge-success';
      case 'Occupied': return 'badge-info';
      case 'Cleaning': return 'badge-warning';
      case 'Maintenance': return 'badge-danger';
      case 'Reserved': return 'badge-primary';
      default: return '';
    }
  };

  const handleOpenAdd = () => {
    setEditRoom(null);
    setForm({ number: '', type: 'Deluxe King', status: 'Available', floor: '1st Floor', price: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (room) => {
    setEditRoom(room);
    setForm({ ...room });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const cleanPrice = Number(String(form.price).replace(/[^0-9.]/g, ''));
      if (isNaN(cleanPrice) || cleanPrice <= 0) {
        alert('Please enter a valid price');
        return;
      }
      
      const payload = {
        number: form.number,
        type: form.type,
        floor: form.floor,
        price: cleanPrice,
        status: form.status
      };

      if (editRoom) {
        await api.rooms.update(editRoom._id, payload);
      } else {
        await api.rooms.create(payload);
      }
      fetchRooms();
      setShowModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save room details');
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await api.rooms.delete(roomId);
      fetchRooms();
      setShowModal(false);
    } catch (err) {
      alert(err.message || 'Failed to delete room');
    }
  };


  return (
    <div className="rooms-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Room Management</h1>
          <p className="page-subtitle">Manage room status, availability, and assignments.</p>
        </div>
        <div className="page-actions">
          <button className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} style={{ marginRight: '8px' }} /> Filter
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} style={{ marginRight: '8px' }} /> Add Room
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="rooms-filters card" style={{ marginBottom: '24px' }}>
          <div className="filter-group">
            <label className="input-label">Room Type</label>
            <select className="input-field" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option>All Types</option>
              <option>Standard</option>
              <option>Deluxe</option>
              <option>Executive</option>
              <option>Suite</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="input-label">Status</label>
            <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Statuses</option>
              <option>Available</option>
              <option>Occupied</option>
              <option>Cleaning</option>
              <option>Maintenance</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="input-label">Floor</label>
            <select className="input-field" value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
              <option>All Floors</option>
              <option>1st Floor</option>
              <option>2nd Floor</option>
              <option>3rd Floor</option>
            </select>
          </div>
        </div>
      )}

      <div className="rooms-grid">
        {!loading && filteredRooms.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '48px' }}>
            No rooms yet. Click &quot;Add Room&quot; to create your first room.
          </p>
        )}
        {filteredRooms.map((room) => (
          <div key={room.number} className="room-card card">
            <div className="room-card-header">
              <div className="room-number">
                <span>Room</span>
                <h3>{room.number}</h3>
              </div>
              <button className="icon-btn" onClick={() => handleOpenEdit(room)}><MoreVertical size={18} /></button>
            </div>
            
            <div className="room-details">
              <p className="room-type">{room.type}</p>
              <p className="room-floor">{room.floor}</p>
            </div>

            <div className="room-footer">
              <span className={`badge ${getStatusBadge(room.status)}`}>{room.status}</span>
              <span className="room-price">{room.price} <span className="text-muted">/night</span></span>
            </div>
          </div>
        ))}
      </div>

      {/* ── White Themed Edit Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: '#fff', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 600 }}>{editRoom ? 'Edit Room Details' : 'Add New Room'}</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)} style={{ background: '#f5f5f5', borderRadius: '50%', padding: '8px' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="input-label">Room Number</label>
                <input className="input-field" value={form.number} onChange={e => setForm({...form, number: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Room Type</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%' }}>
                    <option>Standard King</option>
                    <option>Deluxe King</option>
                    <option>Executive Suite</option>
                    <option>Presidential Suite</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Floor</label>
                  <select className="input-field" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} style={{ width: '100%' }}>
                    <option>1st Floor</option>
                    <option>2nd Floor</option>
                    <option>3rd Floor</option>
                    <option>4th Floor</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Price per Night ($)</label>
                <input className="input-field" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="input-label">Current Status</label>
                <select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: '100%' }}>
                  <option>Available</option>
                  <option>Occupied</option>
                  <option>Cleaning</option>
                  <option>Maintenance</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '36px' }}>
              {editRoom && (
                <button className="btn btn-outline" style={{ borderColor: '#e11d48', color: '#e11d48', padding: '0 16px' }} onClick={() => handleDelete(editRoom._id)}>
                  <Trash2 size={18} />
                </button>
              )}
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                {editRoom ? 'Update Room' : 'Add Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
