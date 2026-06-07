const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom fetch client that handles authentication headers and base URL.
 */
export const requestAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error(
      'Cannot reach the server. Start backend: cd backend && npm start (port 5000).'
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.message || `API Error: ${response.statusText}`;
    if (response.status === 404 && endpoint.includes('/inventory')) {
      throw new Error(
        `${msg} — Restart the backend (npm start in backend folder) so all API routes load.`
      );
    }
    throw new Error(msg);
  }

  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => requestAPI('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => requestAPI('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => requestAPI('/auth/me'),
    updatePassword: (data) =>
      requestAPI('/auth/updatePassword', { method: 'PATCH', body: JSON.stringify(data) }),
    logout: () => requestAPI('/auth/logout')
  },
  
  // Dashboard & stats
  dashboard: {
    getStats: () => requestAPI('/dashboard/stats'),
    getReceptionistStats: () => requestAPI('/dashboard/receptionist'),
  },

  // Rooms management
  rooms: {
    getAll: (query = '') => requestAPI(`/rooms${query}`),
    getOne: (id) => requestAPI(`/rooms/${id}`),
    create: (data) => requestAPI('/rooms', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => requestAPI(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => requestAPI(`/rooms/${id}`, { method: 'DELETE' }),
    updateStatus: (id, status) => requestAPI(`/rooms/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
  },

  // Bookings management
  bookings: {
    getAll: (query = '') => requestAPI(`/bookings${query}`),
    getMy: () => requestAPI('/bookings/my'),
    getOne: (id) => requestAPI(`/bookings/${id}`),
    createPublic: (data) =>
      requestAPI('/bookings/public', { method: 'POST', body: JSON.stringify(data) }),
    create: (data) => requestAPI('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => requestAPI(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    cancel: (id) => requestAPI(`/bookings/${id}/cancel`, { method: 'PATCH' }),
    checkIn: (id) => requestAPI(`/bookings/${id}/checkin`, { method: 'PATCH' }),
    checkOut: (id) => requestAPI(`/bookings/${id}/checkout`, { method: 'PATCH' })
  },

  // Billing and invoices
  billing: {
    getMyInvoices: () => requestAPI('/billing/invoices/my'),
    getInvoices: (query = '') => requestAPI(`/billing/invoices${query}`),
    getInvoice: (id) => requestAPI(`/billing/invoices/${id}`),
    createInvoice: (data) => requestAPI('/billing/invoices', { method: 'POST', body: JSON.stringify(data) }),
    updateInvoice: (id, data) => requestAPI(`/billing/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    recordPayment: (data) => requestAPI('/billing/payments', { method: 'POST', body: JSON.stringify(data) })
  },

  // Housekeeping module
  housekeeping: {
    getTasks: (query = '') => requestAPI(`/housekeeping${query}`),
    createTask: (data) => requestAPI('/housekeeping', { method: 'POST', body: JSON.stringify(data) }),
    updateTask: (id, data) => requestAPI(`/housekeeping/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateStatus: (id, status) => requestAPI(`/housekeeping/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    deleteTask: (id) => requestAPI(`/housekeeping/${id}`, { method: 'DELETE' })
  },

  // Cleaning supplies inventory
  inventory: {
    getAll: () => requestAPI('/inventory'),
    createItem: (data) =>
      requestAPI('/inventory/items', { method: 'POST', body: JSON.stringify(data) }),
    updateItem: (id, data) =>
      requestAPI(`/inventory/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteItem: (id) => requestAPI(`/inventory/items/${id}`, { method: 'DELETE' }),
    requestRestock: (id, data) =>
      requestAPI(`/inventory/items/${id}/request`, { method: 'PATCH', body: JSON.stringify(data) }),
    clearRestockRequest: (id) =>
      requestAPI(`/inventory/items/${id}/clear-request`, { method: 'PATCH' }),
  },

  // Maintenance module
  maintenance: {
    getRequests: (query = '') => requestAPI(`/maintenance${query}`),
    createRequest: (data) => requestAPI('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
    updateRequest: (id, data) => requestAPI(`/maintenance/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    resolveRequest: (id) => requestAPI(`/maintenance/${id}/resolve`, { method: 'PATCH' })
  },

  // User management
  users: {
    getAll: (query = '') => requestAPI(`/users${query}`),
    getStaff: (query = '') => requestAPI(`/users/staff${query}`),
    getGuests: (query = '') => requestAPI(`/users/guests${query}`),
    createGuest: (data) =>
      requestAPI('/users/guests', { method: 'POST', body: JSON.stringify(data) }),
    create: (data) => requestAPI('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => requestAPI(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => requestAPI(`/users/${id}`, { method: 'DELETE' }),
    updateMe: (data) => requestAPI('/users/updateMe', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // Feedback & services
  feedback: {
    getFeedbacks: (query = '') => requestAPI(`/feedback/feedback${query}`),
    createFeedback: (data) => requestAPI('/feedback/feedback', { method: 'POST', body: JSON.stringify(data) }),
    updateFeedbackStatus: (id, status) => requestAPI(`/feedback/feedback/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    deleteFeedback: (id) => requestAPI(`/feedback/feedback/${id}`, { method: 'DELETE' }),
    getServices: (query = '') => requestAPI(`/feedback/services${query}`),
    getMyServices: (roomNumber = '') =>
      requestAPI(
        `/guest/service-requests${roomNumber ? `?roomNumber=${encodeURIComponent(roomNumber)}` : ''}`
      ),
    createService: (data) => requestAPI('/feedback/services', { method: 'POST', body: JSON.stringify(data) }),
    updateServiceStatus: (id, status) => requestAPI(`/feedback/services/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    deleteService: (id) => requestAPI(`/feedback/services/${id}`, { method: 'DELETE' })
  },

  // Private residences (public + admin)
  residences: {
    getAll: (publicOnly = false) =>
      requestAPI(`/residences${publicOnly ? '?public=true' : ''}`),
    getOne: (id) => requestAPI(`/residences/${id}`),
    create: (data) => requestAPI('/residences', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) =>
      requestAPI(`/residences/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => requestAPI(`/residences/${id}`, { method: 'DELETE' }),
    inquire: (data) =>
      requestAPI('/residences/inquire', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Wellness packages (public + admin)
  wellness: {
    getAll: (publicOnly = false) =>
      requestAPI(`/wellness${publicOnly ? '?public=true' : ''}`),
    getOne: (id) => requestAPI(`/wellness/${id}`),
    create: (data) => requestAPI('/wellness', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) =>
      requestAPI(`/wellness/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => requestAPI(`/wellness/${id}`, { method: 'DELETE' })
  },

  // In-app notifications
  notifications: {
    getAll: () => requestAPI('/notifications'),
    markRead: (id) => requestAPI(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => requestAPI('/notifications/mark-all-read', { method: 'PATCH' })
  }
};
