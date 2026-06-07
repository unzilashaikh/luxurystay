import { TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
  <div className="stat-card">
    <div className="stat-header">
      <div className="stat-info">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
      <div className="stat-icon-wrapper">
        <Icon size={24} className="stat-icon" />
      </div>
    </div>
    <div className="stat-footer">
      <span className={`stat-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
        {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {trendValue}
      </span>
      <span className="stat-period">vs last month</span>
    </div>
  </div>
);

import { useEffect, useState } from 'react';
import { api } from '../../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.dashboard.getStats();
        if (res && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalRevenue = stats != null ? `$${(stats.totalRevenue || 0).toLocaleString()}` : '—';
  const occupancyRate = stats != null ? `${stats.occupancyRate ?? 0}%` : '—';
  const newBookingsCount = stats != null ? String(stats.newBookings ?? 0) : '—';
  const revPARVal = stats != null ? `$${stats.revPAR ?? 0}` : '—';

  const recentBookingsList = stats?.recentBookings || [];
  const chartData = stats?.monthlyAnalytics?.values || [];
  const chartLabels = stats?.monthlyAnalytics?.labels || [];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Checked In':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'danger';
      default:
        return 'info';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back! Here is your property's current status.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-outline" onClick={() => navigate('/admin/reports')}>Generate Report</button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/bookings')}>New Booking</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Revenue" value={totalRevenue} icon={DollarSign} trend="up" trendValue="+12.5%" />
        <StatCard title="Occupancy Rate" value={occupancyRate} icon={Users} trend="up" trendValue="+4.2%" />
        <StatCard title="New Bookings" value={newBookingsCount} icon={Calendar} trend="down" trendValue="-2.4%" />
        <StatCard title="RevPAR" value={revPARVal} icon={TrendingUp} trend="up" trendValue="+8.1%" />
      </div>

      <div className="dashboard-content">
        <div className="chart-section card">
          <div className="section-header">
            <h3>Revenue Overview</h3>
            <select className="input-field" style={{ width: 'auto', padding: '4px 8px' }}>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="chart-placeholder">
            {chartData.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '48px 0' }}>
                Revenue chart will appear once payment data exists in the database.
              </p>
            ) : (
              <div className="mock-chart">
                {chartData.map((height, i) => {
                  const max = Math.max(...chartData, 1);
                  return (
                    <div key={i} className="bar-wrapper">
                      <div className="bar" style={{ height: `${(height / max) * 100}%` }}></div>
                      <span className="bar-label">{chartLabels[i] || ''}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="recent-bookings card">
          <div className="section-header">
            <h3>Recent Bookings</h3>
            <button className="btn-text" onClick={() => navigate('/admin/bookings')}>View All</button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room Type</th>
                  <th>Check-In</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {!loading && recentBookingsList.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>
                      No bookings yet. Add rooms and bookings from the admin panel.
                    </td>
                  </tr>
                )}
                {recentBookingsList.map((row, i) => {
                  const name = row.guestName || (row.guest && row.guest.name) || 'Guest';
                  const roomType = row.room?.type || 'Standard Room';
                  const date = row.checkIn ? new Date(row.checkIn).toLocaleDateString() : 'N/A';
                  const badge = getStatusBadgeClass(row.status);
                  
                  return (
                    <tr key={i}>
                      <td className="font-medium">{name}</td>
                      <td className="text-muted">{roomType}</td>
                      <td>{date}</td>
                      <td><span className={`badge badge-${badge}`}>{row.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
