// frontend/src/services/registrarApi.js
import api from './api';

export const registrarApi = {
  // Transfer management
  getPendingTransfers: () => api.get('/registrar/transfers/pending'),
  
  getTransferHistory: () => api.get('/registrar/transfers/history'),
  
  verifyTransfer: (transferId) => api.get(`/registrar/transfers/${transferId}/verify`),
  
  approveTransfer: (data) => api.post('/registrar/transfers/approve', data),
  
  rejectTransfer: (data) => api.post('/registrar/transfers/reject', data),
};

export default registrarApi;