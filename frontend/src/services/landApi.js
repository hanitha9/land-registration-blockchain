// frontend/src/services/landApi.js
import api from './api';

export const landApi = {
  // Citizen land operations
  getMyLands: () => api.get('/lands/my-lands'),
  
  getLand: (landId) => api.get(`/lands/${landId}`),
  getLandById: (landId) => api.get(`/lands/${landId}/blockchain`),
  getLandById: (landId) => api.get(`/lands/${landId}/blockchain`),
  
  getLandHistory: (landId) => api.get(`/lands/${landId}/history`),
  
  initiateSale: (data) => api.post('/lands/initiate-sale', data),
  
  applyLoan: (data) => api.post('/lands/apply-loan', data),
  
  // Request land registration
  requestLandRegistration: (formData) => {
    return api.post('/lands/request-registration', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default landApi;