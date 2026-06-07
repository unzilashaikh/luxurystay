import { BarChart3, TrendingUp, Download, Calendar, ArrowUpRight, PieChart, X, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const Reports = () => {
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(null);
  const [reportError, setReportError] = useState('');
  const [reportsList, setReportsList] = useState([]);
  const [stats, setStats] = useState(null);

  const [form, setForm] = useState({ name: '', category: 'Financial', range: 'Last 30 Days', format: 'PDF' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.dashboard.getStats();
        if (res?.data) setStats(res.data);
      } catch (err) {
        console.error('Failed to load report stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleGenerate = () => {
    if (!form.name) {
      setReportError('Please enter a Report Title.');
      return;
    }
    setIsGenerating(true);
    setReportError('');

    setTimeout(() => {
      const newReport = {
        name: form.name,
        type: form.category,
        lastGenerated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        size: '—',
        snapshot: stats
      };
      setReportsList([newReport, ...reportsList]);
      setIsGenerating(false);
      setShowModal(false);
      setForm({ name: '', category: 'Financial', range: 'Last 30 Days', format: 'PDF' });
    }, 800);
  };

  const handleDownload = (report) => {
    setDownloadingReport(report.name);

    setTimeout(() => {
      const csvContent = [
        'Report Name,' + report.name,
        'Category,' + report.type,
        'Date Generated,' + new Date().toLocaleDateString(),
        'Total Revenue,' + (report.snapshot?.totalRevenue ?? stats?.totalRevenue ?? 0),
        'Occupancy Rate,' + (report.snapshot?.occupancyRate ?? stats?.occupancyRate ?? 0) + '%',
        'New Bookings,' + (report.snapshot?.newBookings ?? stats?.newBookings ?? 0),
        'RevPAR,' + (report.snapshot?.revPAR ?? stats?.revPAR ?? 0)
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.name.replace(/\s+/g, '_')}_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadingReport(null);
    }, 500);
  };

  const revPAR = stats?.revPAR ?? 0;
  const occupancy = stats?.occupancyRate ?? 0;
  const adr = occupancy > 0 ? (revPAR / (occupancy / 100)).toFixed(2) : '0.00';

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">View financial and operational performance from live database stats.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setReportError(''); }}>
          <BarChart3 size={18} style={{ marginRight: '8px' }} /> Generate New Report
        </button>
      </div>

      <div className="analytics-overview grid grid-cols-3" style={{ gap: '20px', marginTop: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px' }}>
          <div style={{ color: 'var(--color-primary)', marginBottom: '12px' }}><TrendingUp size={32} /></div>
          <p className="stat-title" style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Average Daily Rate</p>
          <h3 className="stat-value" style={{ fontSize: '28px', margin: '8px 0' }}>${adr}</h3>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>From room prices & occupancy</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px' }}>
          <div style={{ color: 'var(--color-info)', marginBottom: '12px' }}><PieChart size={32} /></div>
          <p className="stat-title" style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>RevPAR</p>
          <h3 className="stat-value" style={{ fontSize: '28px', margin: '8px 0' }}>${revPAR}</h3>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Live from dashboard API</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px' }}>
          <div style={{ color: 'var(--color-warning)', marginBottom: '12px' }}><Calendar size={32} /></div>
          <p className="stat-title" style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Occupancy Rate</p>
          <h3 className="stat-value" style={{ fontSize: '28px', margin: '8px 0' }}>{occupancy}%</h3>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Based on room status</span>
        </div>
      </div>

      <div className="reports-section grid grid-cols-1" style={{ gap: '24px', marginTop: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Generated Reports (this session)</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Category</th>
                  <th>Date Generated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportsList.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                      No reports generated yet. Use the button above to export a snapshot of current stats.
                    </td>
                  </tr>
                )}
                {reportsList.map((report, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '500' }}>{report.name}</td>
                    <td><span className="badge badge-info">{report.type}</span></td>
                    <td>{report.lastGenerated}</td>
                    <td>
                      <button className="icon-btn" title="Download Report" onClick={() => handleDownload(report)}><Download size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: '#fff', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <FileText size={20} />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 600 }}>Generate Report</h2>
              </div>
              <button className="icon-btn" onClick={() => setShowModal(false)} style={{ background: '#f5f5f5', borderRadius: '50%', padding: '8px' }}><X size={20} /></button>
            </div>

            {reportError && (
              <div style={{ padding: '10px', backgroundColor: '#ffebee', color: 'var(--color-danger)', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', border: '1px solid #ffcdd2' }}>
                {reportError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="input-label">Report Title</label>
                <input className="input-field" placeholder="e.g. Q4 Revenue Summary" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Category</label>
                  <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: '100%' }}>
                    <option>Financial</option>
                    <option>Operational</option>
                    <option>Service</option>
                    <option>Management</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Export Format</label>
                  <select className="input-field" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} style={{ width: '100%' }}>
                    <option>CSV Data</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Date Range</label>
                <select className="input-field" value={form.range} onChange={(e) => setForm({ ...form, range: e.target.value })} style={{ width: '100%' }}>
                  <option>Today</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last Quarter</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '36px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Export Snapshot'}
              </button>
            </div>
          </div>
        </div>
      )}

      {downloadingReport && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', minWidth: '250px', background: '#fff' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-surface-alt)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ color: 'var(--color-primary)', margin: 0 }}>Downloading Report...</h3>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '14px', textAlign: 'center' }}>{downloadingReport}</p>
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
};

export default Reports;
