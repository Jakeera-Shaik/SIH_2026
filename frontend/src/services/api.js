import axios from 'axios';

// Toggle between mock data and real backend server
export const USE_MOCK = true;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for inserting JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agri_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common error statuses
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('agri_auth_token');
      localStorage.removeItem('agri_user_role');
      window.location.href = '/login';
    }
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
