// frontend/src/services/authApi.js
import api from './api';

export const authService = {
  // Citizen login
  login: (data) => {
    return api.post('/auth/login', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  
  // Officer login
  officerLogin: (data) => {
    return api.post('/auth/officer/login', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  
  // Get user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update profile photo
  updateProfilePhoto: (formData) => {
    return api.post('/auth/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Signup steps
  verifyAadhaar: (formData) => {
    return api.post('/auth/signup/step1', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  verifyPAN: (formData) => {
    return api.post('/auth/signup/step2', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  sendOTP: (data) => {
    return api.post('/auth/signup/send-otp', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  
  verifyOTP: (data) => {
    return api.post('/auth/signup/verify-otp', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  
  completeSignup: (data) => {
    return api.post('/auth/signup/complete', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

// Also export as default for backward compatibility
export default authService;