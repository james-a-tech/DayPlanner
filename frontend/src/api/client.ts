import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const taskAPI = {
  getTasks: () => api.get('/tasks'),
  getTask: (id: string) => api.get(`/tasks/${id}`),
  createTask: (data: any) => api.post('/tasks', data),
  updateTask: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  completeTask: (id: string, data: any) => api.put(`/tasks/${id}/complete`, data),
};

export const timeSlotAPI = {
  getTimeSlots: () => api.get('/time-slots'),
  createTimeSlot: (data: any) => api.post('/time-slots', data),
  updateTimeSlot: (id: string, data: any) => api.put(`/time-slots/${id}`, data),
  deleteTimeSlot: (id: string) => api.delete(`/time-slots/${id}`),
};

export const reportAPI = {
  getDailyReport: (date: string) => api.get(`/reports/${date}`),
  updateDailyReport: (date: string, data: any) => api.put(`/reports/${date}`, data),
  getAnalytics: (startDate: string, endDate: string) =>
    api.get('/reports/analytics/summary', { params: { startDate, endDate } }),
};

export default api;
