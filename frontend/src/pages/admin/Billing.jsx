import { Receipt, Download, ExternalLink, Filter, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { downloadInvoicePdf } from '../../utils/downloadInvoicePdf';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({ reservationId: '', extraCharges: '0' });
  const [invoiceError, setInvoiceError] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.billing.getInvoices();
      if (res?.data?.invoices) setInvoices(res.data.invoices);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.bookings.getAll();
      if (res?.data?.bookings) setBookings(res.data.bookings);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchBookings();
  }, []);

  const handleCreateInvoice = async () => {
    if (!newInvoiceData.reservationId) {
      setInvoiceError('Please select a booking/reservation.');
      return;
    }
    try {
      await api.billing.createInvoice({
        reservationId: newInvoiceData.reservationId,
        extraCharges: Number(newInvoiceData.extraCharges) || 0
      });
      fetchInvoices();
      setShowInvoiceModal(false);
      setNewInvoiceData({ reservationId: '', extraCharges: '0' });
      setInvoiceError('');
    } catch (err) {
      setInvoiceError(err.message || 'Failed to create invoice');
    }
  };

  const handleDownload = (inv) => {
    setDownloadingId(inv.invoiceNumber || inv._id);
    setTimeout(async () => {
      try {
        await downloadInvoicePdf(inv);
      } catch (err) {
        alert(err.message || 'Failed to generate PDF');
      } finally {
        setDownloadingId(null);
      }
    }, 300);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const idStr = (inv.invoiceNumber || '').toLowerCase();
    const guestStr = (inv.guestName || '').toLowerCase();
    const matchesSearch = idStr.includes(searchQuery.toLowerCase()) || guestStr.includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Invoices</h1>
          <p className="page-subtitle">Manage guest folios, payments, and invoices.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowInvoiceModal(true); setInvoiceError(''); }}>
          <Receipt size={18} style={{ marginRight: '8px' }} /> Create Invoice
        </button>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="table-actions" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="search-box" style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input type="text" className="input-field" placeholder="Search by Invoice ID or Guest Name..." style={{ paddingLeft: '40px', width: '100%' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-outline" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
              <Filter size={18} style={{ marginRight: '8px' }} /> Filters {filterStatus !== 'All' && `(${filterStatus})`}
            </button>
            {showFilterDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', backgroundColor: 'var(--color-surface)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 10, padding: '8px 0', minWidth: '150px', border: '1px solid var(--color-border)' }}>
                {['All', 'Paid', 'Unpaid', 'Partially Paid'].map((status) => (
                  <button key={status} style={{ display: 'block', width: '100%', padding: '8px 16px', textAlign: 'left', background: filterStatus === status ? 'var(--color-surface-alt)' : 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }} onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }}>
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Guest Name</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Loading invoices...</td></tr>
              )}
              {!loading && filteredInvoices.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>No invoices yet. Create a booking first, then generate an invoice.</td></tr>
              )}
              {filteredInvoices.map((inv) => (
                <tr key={inv._id}>
                  <td style={{ fontWeight: '600' }}>{inv.invoiceNumber}</td>
                  <td>{inv.guestName}</td>
                  <td style={{ fontWeight: '600' }}>${inv.totalAmount?.toFixed(2)}</td>
                  <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : inv.status === 'Unpaid' ? 'badge-warning' : 'badge-info'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" title="Download" onClick={() => handleDownload(inv)}><Download size={16} /></button>
                      <button className="icon-btn" title="View Details" onClick={() => setViewingInvoice(inv)}><ExternalLink size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInvoiceModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowInvoiceModal(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>Create New Invoice</h2>
            {invoiceError && (
              <div style={{ padding: '10px', backgroundColor: '#ffebee', color: 'var(--color-danger)', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', border: '1px solid #ffcdd2' }}>
                {invoiceError}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Booking / Reservation</label>
                <select className="input-field" value={newInvoiceData.reservationId} onChange={(e) => setNewInvoiceData({ ...newInvoiceData, reservationId: e.target.value })} style={{ width: '100%' }}>
                  <option value="">Select a booking...</option>
                  {bookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.bookingId || b._id} — {b.guestName}
                      {b.guestEmail ? ` · ${b.guestEmail}` : ''} (Room {b.room?.number || '?'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Extra Charges ($)</label>
                <input type="number" className="input-field" value={newInvoiceData.extraCharges} onChange={(e) => setNewInvoiceData({ ...newInvoiceData, extraCharges: e.target.value })} style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateInvoice}>Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {viewingInvoice && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setViewingInvoice(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Receipt size={24} color="var(--color-primary)" />
              <h2 style={{ color: 'var(--color-primary)' }}>Invoice Details</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Invoice ID</span>
                <span style={{ fontWeight: '600' }}>{viewingInvoice.invoiceNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Guest Name</span>
                <span>{viewingInvoice.guestName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Room charge</span>
                <span>${Number(viewingInvoice.roomCharge || 0).toFixed(2)}</span>
              </div>
              {(viewingInvoice.lineItems?.length > 0) && (
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Extra charges</span>
                  {viewingInvoice.lineItems.map((line, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ paddingRight: '8px' }}>{line.description}</span>
                      <span>${Number(line.amount || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontWeight: 600 }}>
                    <span>Extras subtotal</span>
                    <span>${Number(viewingInvoice.extraCharges || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
              {!viewingInvoice.lineItems?.length && Number(viewingInvoice.extraCharges) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Extra charges</span>
                  <span>${Number(viewingInvoice.extraCharges).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Tax + service</span>
                <span>${(Number(viewingInvoice.tax || 0) + Number(viewingInvoice.serviceCharge || 0)).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Total</span>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>${viewingInvoice.totalAmount?.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Status</span>
                <span className={`badge ${viewingInvoice.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{viewingInvoice.status}</span>
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { handleDownload(viewingInvoice); setViewingInvoice(null); }}>
                <Download size={18} style={{ marginRight: '8px' }} /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {downloadingId && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', minWidth: '250px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-surface-alt)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ color: 'var(--color-primary)', margin: 0 }}>Generating PDF...</h3>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '14px' }}>{downloadingId}</p>
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
};

export default Billing;
