// frontend/src/services/bankApi.js
import api from './api';

export const bankApi = {
  getPendingLoans:    () => api.get('/bank/loans/pending'),
  getActiveMortgages: () => api.get('/bank/loans/active'),
  getClearedLoans:    () => api.get('/bank/loans/cleared'),
  getRejectedLoans:   () => api.get('/bank/loans/rejected'),

  approveLoan: (data) => api.post('/bank/loans/approve', data),
  rejectLoan:  (data) => api.post('/bank/loans/reject',  data),
  clearLoan:   (data) => api.post('/bank/loans/clear',   data),
};

export default bankApi;