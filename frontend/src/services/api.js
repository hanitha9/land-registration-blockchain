import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const landService = {
  // Get all lands
  getAllLands: async () => {
    const response = await api.get('/lands');
    return response.data;
  },

  // Get specific land
  getLand: async (landId) => {
    const response = await api.get(`/lands/${landId}`);
    return response.data;
  },

  // Register new land
  registerLand: async (landData) => {
    const response = await api.post('/lands/register', landData);
    return response.data;
  },

  // Transfer land
  transferLand: async (landId, newOwnerName) => {
    const response = await api.put(`/lands/${landId}/transfer`, { newOwnerName });
    return response.data;
  },

  // Delete land
  deleteLand: async (landId) => {
    const response = await api.delete(`/lands/${landId}`);
    return response.data;
  },
};

export default api;
