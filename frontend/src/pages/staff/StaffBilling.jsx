import { Receipt, Download, ExternalLink, Filter, Search, X, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { api } from '../../utils/api';
import { downloadInvoicePdf } from '../../utils/downloadInvoicePdf';

const StaffBilling = () => {
  const [invoices, setInvoices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({ reservationId: '', extraCharges: '0' });
  const [invoiceError, setInvoiceError] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [invRes, bookRes] = await Promise.all([
        api.billing.getInvoices(),
        api.bookings.getAll(),
      ]);
      setInvoices(invRes?.data?.invoices || []);
      setBookings(bookRes?.data?.bookings || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not load billing data.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const unpaid = invoices.filter((i) => i.status === 'Unpaid');
    const paid = invoices.filter((i) => i.status === 'Paid');
    const totalDue = unpaid.reduce((s, i) => s + (i.totalAmount || 0), 0);
    const totalPaid = paid.reduce((s, i) => s + (i.totalAmount || 0), 0);
    return {
      total: invoices.length,
      unpaidCount: unpaid.length,
      paidCount: paid.length,
      totalDue,
      totalPaid,
    };
  }, [invoices]);

  const handleCreateInvoice = async () => {
    if (!newInvoiceData.reservationId) {
      setInvoiceError('Please select a booking.');
      return;
    }
    try {
      await api.billing.createInvoice({
        reservationId: newInvoiceData.reservationId,
        extraCharges: Number(newInvoiceData.extraCharges) || 0,
      });
      setShowInvoiceModal(false);
      setNewInvoiceData({ reservationId: '', extraCharges: '0' });
      setInvoiceError('');
      loadData();
    } catch (err) {
      setInvoiceError(err.message || 'Failed to create invoice');
    }
  };

  const handleMarkPaid = async (inv) => {
    setActionLoading(inv._id);
    try {
      await api.billing.recordPayment({
        invoiceId: inv._id,
        amount: inv.totalAmount,
        method: 'Front Desk',
      });
      loadData();
      if (viewingInvoice?._id === inv._id) setViewingInvoice(null);
    } catch (err) {
      alert(err.message || 'Payment failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (inv) => {
    try {
      await downloadInvoicePdf(inv);
    } catch (err) {
      alert(err.message || 'Failed to generate PDF');
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (inv.invoiceNumber || '').toLowerCase().includes(q) ||
      (inv.guestName || '').toLowerCase().includes(q);
    const matchesFilter = filterStatus === 'All' || inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const bookingsWithoutInvoice = useMemo(() => {
    const invoicedReservationIds = new Set(
      invoices.map((i) => String(i.reservation?._id || i.reservation))
    );
    return bookings.filter(
      (b) =>
        !['Cancelled', 'Checked Out'].includes(b.status) &&
        !invoicedReservationIds.has(String(b._id))
    );
  }, [bookings, invoices]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Payments</h1>
          <p className="page-subtitle">Invoices and payments from the database.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setShowInvoiceModal(true);
            setInvoiceError('');
          }}
        >
          <Receipt size={18} style={{ marginRight: '8px' }} />
          Create Invoice
        </button>
      </div>

      {error && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            padding: '14px',
            background: '#ffebee',
            border: '1px solid #ffcdd2',
            color: 'var(--color-danger)',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-3" style={{ gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '12px' }}>Paid</span>
            <h2 style={{ margin: 0 }}>{stats.paidCount}</h2>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              ${stats.totalPaid.toFixed(2)} collected
            </span>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#FFF8E1', color: '#F9A825', padding: '12px', borderRadius: '12px' }}>
            <Clock size={24} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '12px' }}>Unpaid</span>
            <h2 style={{ margin: 0 }}>{stats.unpaidCount}</h2>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              ${stats.totalDue.toFixed(2)} due
            </span>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#E3F2FD', color: '#1976D2', padding: '12px', borderRadius: '12px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '12px' }}>Total Invoices</span>
            <h2 style={{ margin: 0 }}>{stats.total}</h2>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Search invoice or guest..."
              style={{ paddingLeft: '40px', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
              <Filter size={18} style={{ marginRight: '8px' }} />
              {filterStatus === 'All' ? 'Filters' : filterStatus}
            </button>
            {showFilterDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  zIndex: 10,
                  padding: '8px 0',
                  minWidth: '150px',
                  border: '1px solid var(--color-border)',
                }}
              >
                {['All', 'Paid', 'Unpaid', 'Partially Paid'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 16px',
                      textAlign: 'left',
                      background: filterStatus === status ? 'var(--color-surface-alt)' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setFilterStatus(status);
                      setShowFilterDropdown(false);
                    }}
                  >
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
                <th>Invoice</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading invoices...
                  </td>
                </tr>
              )}
              {!loading && filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    No invoices found. Create an invoice from a booking.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredInvoices.map((inv) => (
                  <tr key={inv._id}>
                    <td style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{inv.invoiceNumber}</td>
                    <td>{inv.guestName || '—'}</td>
                    <td>
                      {inv.reservation?.room?.number ? `Room ${inv.reservation.room.number}` : '—'}
                    </td>
                    <td style={{ fontWeight: '600' }}>${inv.totalAmount?.toFixed(2)}</td>
                    <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <span
                        className={`badge ${
                          inv.status === 'Paid'
                            ? 'badge-success'
                            : inv.status === 'Unpaid'
                              ? 'badge-warning'
                              : 'badge-info'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Download PDF"
                          onClick={() => handleDownload(inv)}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="View"
                          onClick={() => setViewingInvoice(inv)}
                        >
                          <ExternalLink size={16} />
                        </button>
                        {inv.status !== 'Paid' && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            disabled={actionLoading === inv._id}
                            onClick={() => handleMarkPaid(inv)}
                          >
                            {actionLoading === inv._id ? '...' : 'Mark Paid'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInvoiceModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '24px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowInvoiceModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>Create Invoice</h2>
            {invoiceError && (
              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#ffebee',
                  color: 'var(--color-danger)',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '14px',
                }}
              >
                {invoiceError}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="input-label">Booking *</label>
                <select
                  className="input-field"
                  style={{ width: '100%' }}
                  value={newInvoiceData.reservationId}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, reservationId: e.target.value })}
                >
                  <option value="">Select booking...</option>
                  {bookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.bookingId} — {b.guestName}
                      {b.guestEmail ? ` · ${b.guestEmail}` : ''} (Room {b.room?.number || '?'})
                    </option>
                  ))}
                </select>
              </div>
              {bookingsWithoutInvoice.length > 0 && (
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                  {bookingsWithoutInvoice.length} active booking(s) without invoice yet.
                </p>
              )}
              <div>
                <label className="input-label">Extra charges ($)</label>
                <input
                  type="number"
                  className="input-field"
                  style={{ width: '100%' }}
                  value={newInvoiceData.extraCharges}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, extraCharges: e.target.value })}
                />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowInvoiceModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleCreateInvoice}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingInvoice && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '24px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setViewingInvoice(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>Invoice Details</h2>
            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: 0 }}>
                <strong>Invoice:</strong> {viewingInvoice.invoiceNumber}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Guest:</strong> {viewingInvoice.guestName}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Room charge:</strong> ${viewingInvoice.roomCharge?.toFixed(2)}
              </p>
              {viewingInvoice.lineItems?.length > 0 && (
                <div style={{ margin: 0 }}>
                  <strong>Extra charges:</strong>
                  <ul style={{ margin: '6px 0 0', paddingLeft: '18px', fontSize: '13px' }}>
                    {viewingInvoice.lineItems.map((line, i) => (
                      <li key={i}>
                        {line.description} — ${Number(line.amount || 0).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p style={{ margin: '6px 0 0', fontSize: '13px' }}>
                    Extras subtotal: ${Number(viewingInvoice.extraCharges || 0).toFixed(2)}
                  </p>
                </div>
              )}
              {!viewingInvoice.lineItems?.length && Number(viewingInvoice.extraCharges) > 0 && (
                <p style={{ margin: 0 }}>
                  <strong>Extra charges:</strong> ${Number(viewingInvoice.extraCharges).toFixed(2)}
                </p>
              )}
              <p style={{ margin: 0 }}>
                <strong>Tax + service:</strong> $
                {((viewingInvoice.tax || 0) + (viewingInvoice.serviceCharge || 0)).toFixed(2)}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Total:</strong> ${viewingInvoice.totalAmount?.toFixed(2)}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Status:</strong> {viewingInvoice.status}
              </p>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleDownload(viewingInvoice)}
              >
                <Download size={16} style={{ marginRight: 8 }} />
                Download PDF
              </button>
              {viewingInvoice.status !== 'Paid' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={actionLoading === viewingInvoice._id}
                  onClick={() => handleMarkPaid(viewingInvoice)}
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffBilling;
