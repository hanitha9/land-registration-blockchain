import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  // Step 1: Aadhaar verification
  verifyAadhaar: async (formData) => {
    const response = await authApi.post('/signup/step1', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Step 2: PAN verification
  verifyPAN: async (formData) => {
    const response = await authApi.post('/signup/step2', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Step 3: Send OTP
  sendOTP: async (mobileNumber) => {
    const response = await authApi.post('/signup/send-otp', { mobileNumber });
    return response.data;
  },

  // Step 4: Verify OTP
  verifyOTP: async (mobileNumber, otp) => {
    const response = await authApi.post('/signup/verify-otp', { mobileNumber, otp });
    return response.data;
  },

  // Complete signup
  completeSignup: async (userData) => {
    const response = await authApi.post('/signup/complete', userData);
    return response.data;
  },

  // Login
  login: async (aadhaarNumber, password) => {
    const response = await authApi.post('/login', { aadhaarNumber, password });
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await authApi.get('/profile');
    return response.data;
  },

  // Upload profile photo
  uploadProfilePhoto: async (formData) => {
    const response = await authApi.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default authApi;
