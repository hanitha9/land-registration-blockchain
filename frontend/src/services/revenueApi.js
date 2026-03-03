// frontend/src/services/revenueApi.js
import api from './api';

export const revenueApi = {
  // Land management
  createLandRecord: (data) => api.post('/revenue/lands', data),
  
  getAllLands: (params) => api.get('/revenue/lands', { params }),
  
  updateLand: (landId, data) => api.put(`/revenue/lands/${landId}`, data),
  
  markLandDisputed: (data) => api.post('/revenue/lands/mark-disputed', data),
  
  resolveLandDispute: (data) => api.post('/revenue/lands/resolve-dispute', data),
  
  // Statistics
  getStatistics: () => api.get('/revenue/statistics'),
  getPendingRegistrations: () => api.get('/revenue/registrations/pending'),
  approveLandRegistration: (data) => api.post('/revenue/registrations/approve', data),
  rejectLandRegistration: (data) => api.post('/revenue/registrations/reject', data),
};

export default revenueApi;