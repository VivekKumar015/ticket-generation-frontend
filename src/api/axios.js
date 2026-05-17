import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — auto logout if token expired
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ===== AUTH =====
export const loginUser = (data) => API.post('/api/auth/login', data);
export const registerUser = (data) => API.post('/api/auth/register', data);
export const changePassword = (data) => API.post('/api/auth/change-password', data);

// ===== TICKETS =====
export const createTicket = (data) => API.post('/api/tickets', data);
export const updateTicket = (id, data) => API.put(`/api/tickets/${id}`, data);
export const getAllTickets = () => API.get('/api/tickets');
export const getMyTickets = () => API.get('/api/tickets/my');
export const getAssignedTickets = () => API.get('/api/tickets/assigned');
export const searchTickets = (params) => API.get('/api/tickets/search', { params });

// ===== DASHBOARD =====
export const getAdminDashboard = () => API.get('/api/dashboard/admin');

// ===== USERS =====
export const getMe = () => API.get('/api/users/me');
export const getAllUsers = () => API.get('/api/users');
export const getAllEmployees = () => API.get('/api/users/employees');

// ===== PROJECTS =====
export const getAllProjects = () => API.get('/api/projects');

// ===== COMMENTS =====
export const addComment = (ticketId, data) => API.post(`/api/tickets/${ticketId}/comments`, data);
export const getComments = (ticketId) => API.get(`/api/tickets/${ticketId}/comments`);

export default API;