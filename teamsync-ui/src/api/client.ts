import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (no response from server)
    if (!error.response) {
      const networkError = new Error('Network error: Unable to connect to server');
      networkError.name = 'NetworkError';
      return Promise.reject(networkError);
    }

    // Handle specific HTTP status codes
    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        break;

      case 403:
        // Forbidden
        error.message = data?.error || 'You do not have permission to perform this action';
        break;

      case 404:
        // Not found
        error.message = data?.error || 'Resource not found';
        break;

      case 422:
        // Validation error
        error.message = data?.error || 'Validation failed';
        error.validationErrors = data?.details || [];
        break;

      case 500:
        // Server error
        error.message = data?.error || 'An unexpected server error occurred';
        break;

      default:
        error.message = data?.error || 'An error occurred';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
