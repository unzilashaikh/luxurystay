import { useGuest } from '../../context/GuestContext';
import { downloadInvoicePdf } from '../../utils/downloadInvoicePdf';

const GuestBilling = () => {
  const { invoices, loading } = useGuest();

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Billing</h1>
          <p className="page-subtitle">Invoices for your stays.</p>
        </div>
      </div>

      <div className="card">
        {loading && <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading invoices...</p>}
        {!loading && invoices.length === 0 && (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No invoices yet.</p>
        )}
        {!loading && invoices.length > 0 && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td style={{ fontWeight: '600' }}>{inv.invoiceNumber}</td>
                    <td>${inv.totalAmount?.toFixed(2)}</td>
                    <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{inv.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-text"
                        onClick={async () => {
                          try {
                            await downloadInvoicePdf(inv);
                          } catch (err) {
                            alert(err.message || 'Failed to generate PDF');
                          }
                        }}
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestBilling;
