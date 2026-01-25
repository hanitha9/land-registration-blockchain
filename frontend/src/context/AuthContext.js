import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.user); // Changed from response.data to response.user
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (aadhaarNumber, password) => {
    const response = await authService.login(aadhaarNumber, password);
    setToken(response.token);
    setUser(response.user); // Changed from response.data to response.user
    localStorage.setItem('token', response.token);
    return response;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    setUser,
    updateUser // Added this
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};