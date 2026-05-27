import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
export const getTicketById = (id) => API.get(`/api/tickets/${id}`);
export const getMyTickets = () => API.get('/api/tickets/my');
export const getAssignedTickets = () => API.get('/api/tickets/assigned');
export const getTicketsByProject = (projectId) => API.get(`/api/tickets/project/${projectId}`);
export const searchTickets = (params) => API.get('/api/tickets/search', { params });

// ===== DASHBOARD =====
export const getAdminDashboard = () => API.get('/api/dashboard/admin');

// ===== USERS =====
export const getMe = () => API.get('/api/users/me');
export const getAllUsers = () => API.get('/api/users');
export const getAllEmployees = () => API.get('/api/users/employees');

// ===== PROJECTS (public list for ticket creation) =====
export const getAllProjects = () => API.get('/api/projects');

// ===== CONFIGURATION (admin only) =====
export const configGetAllProjects = () => API.get('/api/config/projects');
export const configCreateProject = (data) => API.post('/api/config/projects', data);
export const configUpdateProject = (id, data) => API.put(`/api/config/projects/${id}`, data);
export const configDeleteProject = (id) => API.delete(`/api/config/projects/${id}`);

export const configGetAllShifts = () => API.get('/api/config/shifts');
export const configCreateShift = (data) => API.post('/api/config/shifts', data);
export const configUpdateShift = (id, data) => API.put(`/api/config/shifts/${id}`, data);

export const configGetAllEmployees = () => API.get('/api/config/employees');
export const configAssignEmployee = (data) => API.post('/api/config/employee-project', data);
export const configRemoveEmployee = (userId, projectId) =>
  API.delete(`/api/config/employee-project/${userId}/project/${projectId}`);
export const configGetProjectEmployees = (projectId) =>
  API.get(`/api/config/projects/${projectId}/employees`);
export const configGetEmployeeProjects = (userId) =>
  API.get(`/api/config/employees/${userId}/projects`);

// ===== REPORTS =====
export const getOverallReport = () => API.get('/api/reports/overall');
export const getProjectWiseReport = () => API.get('/api/reports/projects');
export const getProjectReport = (projectId) => API.get(`/api/reports/projects/${projectId}`);

// ===== COMMENTS =====
export const addComment = (ticketId, data) => API.post(`/api/tickets/${ticketId}/comments`, data);
export const getComments = (ticketId) => API.get(`/api/tickets/${ticketId}/comments`);

export default API;