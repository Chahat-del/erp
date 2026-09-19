import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'https://erp-j8dd.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});




// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 401 globally
api.interceptors.response.use(
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

// Auth
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const changePassword = (data) =>
  api.post('/auth/change-password', data);

// Employees
export const getEmployees = (params) => api.get('/employees', { params });
export const createEmployee = (data) => api.post('/employees', data);
export const getEmployee = (id) => api.get(`/employees/${id}`);
export const updateEmployee = (id, data) =>
  api.put(`/employees/${id}`, data);
export const toggleEmployeeStatus = (id) =>
  api.patch(`/employees/${id}/toggle-status`);
export const resetPassword = (id, data) =>
  api.patch(`/employees/${id}/reset-password`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// Projects
export const getProjects = (params) => api.get('/projects', { params });
export const createProject = (data) => api.post('/projects', data);
export const getProject = (id) => api.get(`/projects/${id}`);
export const updateProject = (id, data) =>
  api.put(`/projects/${id}`, data);
export const updateProjectStatus = (id, data) =>
  api.patch(`/projects/${id}/status`);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Tasks
export const getTasks = (params) => api.get('/tasks', { params });
export const createTask = (data) => api.post('/tasks', data);
export const getTask = (id) => api.get(`/tasks/${id}`);
export const updateTask = (id, data) =>
  api.put(`/tasks/${id}`, data);
export const updateTaskStatus = (id, data) =>
  api.patch(`/tasks/${id}/status`, data);
export const addComment = (id, data) =>
  api.post(`/tasks/${id}/comment`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// Reports
export const getReports = (params) => api.get('/reports', { params });
export const createReport = (data) => api.post('/reports', data);
export const getReport = (id) => api.get(`/reports/${id}`);
export const updateReport = (id, data) =>
  api.put(`/reports/${id}`, data);
export const getMissingReports = () => api.get('/reports/missing');
export const reviewReport = (id, data) =>
  api.patch(`/reports/${id}/review`, data);

// Dashboard
export const getAdminDashboard = () => api.get('/dashboard/admin');
export const getEmployeeDashboard = () => api.get('/dashboard/employee');
export const getPerformance = (id) =>
  api.get(`/dashboard/performance/${id}`);

export default api;