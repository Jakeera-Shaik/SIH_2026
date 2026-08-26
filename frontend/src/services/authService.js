import apiClient, { USE_MOCK } from './api';
import { MOCK_FARMER_PROFILE, MOCK_BUYER_PROFILE } from './mockData';

export const authService = {
  login: async (credentials) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 400));
      const isBuyer = credentials.email?.toLowerCase().includes('buyer') || credentials.role === 'buyer';
      const user = isBuyer ? MOCK_BUYER_PROFILE : MOCK_FARMER_PROFILE;
      const token = 'mock-jwt-token-sih2026-' + Date.now();
      
      localStorage.setItem('agri_auth_token', token);
      localStorage.setItem('agri_user', JSON.stringify(user));
      localStorage.setItem('agri_user_role', user.role);

      return { success: true, token, user };
    }
    return apiClient.post('/auth/login', credentials);
  },

  register: async (userData) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 500));
      const token = 'mock-jwt-token-sih2026-' + Date.now();
      const user = {
        id: 'u-' + Date.now(),
        ...userData,
        role: userData.role || 'farmer'
      };

      localStorage.setItem('agri_auth_token', token);
      localStorage.setItem('agri_user', JSON.stringify(user));
      localStorage.setItem('agri_user_role', user.role);

      return { success: true, token, user };
    }
    return apiClient.post('/auth/register', userData);
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('agri_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('agri_auth_token');
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_user_role');
  }
};

export default authService;
