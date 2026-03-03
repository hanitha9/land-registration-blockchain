// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ FIX: Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle 401 responses globally — clear storage and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const landService = {
  getAllLands: async () => {
    const response = await api.get('/lands');
    return response.data;
  },

  getLand: async (landId) => {
    const response = await api.get(`/lands/${landId}`);
    return response.data;
  },

  registerLand: async (landData) => {
    const response = await api.post('/lands/register', landData);
    return response.data;
  },

  transferLand: async (landId, newOwnerName) => {
    const response = await api.put(`/lands/${landId}/transfer`, { newOwnerName });
    return response.data;
  },

  deleteLand: async (landId) => {
    const response = await api.delete(`/lands/${landId}`);
    return response.data;
  },
};

export default api;