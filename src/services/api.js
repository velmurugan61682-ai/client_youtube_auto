import axios from 'axios';
import { API_BASE_URL } from '../config/environment.js';

export { API_BASE_URL };

console.log(`Production API URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach appropriate Bearer Token (Admin vs Client)
api.interceptors.request.use((config) => {
  const isAdminRoute = config.url && config.url.includes('/admin');
  let adminToken = localStorage.getItem('adminToken');
  let token = localStorage.getItem('token');

  if (typeof token === 'string') {
    token = token.trim().replace(/^["']|["']$/g, '');
    if (token === 'null' || token === 'undefined') token = null;
  }
  if (typeof adminToken === 'string') {
    adminToken = adminToken.trim().replace(/^["']|["']$/g, '');
    if (adminToken === 'null' || adminToken === 'undefined') adminToken = null;
  }

  if (isAdminRoute && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

// Response interceptor to handle auto-retry once on 5xx or network errors
let apiConnectedLogged = false;
api.interceptors.response.use(
  (response) => {
    if (!apiConnectedLogged) {
      console.log('API connected');
      apiConnectedLogged = true;
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Handle 401 Unauthenticated errors separately for Admin vs Client
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
        console.warn('[API Interceptor] 401 unauthenticated error received on admin route. Clearing adminToken...');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else if (!currentPath.startsWith('/admin') && currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/' && !currentPath.startsWith('/oauth/callback')) {
        console.warn('[API Interceptor] 401 unauthenticated error received on client route. Clearing token...');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Handle 402 Subscription Expired / Required errors
    if (error.response && error.response.status === 402) {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/subscription') && !currentPath.startsWith('/admin') && currentPath !== '/login') {
        console.warn('[API Interceptor] 402 Subscription Expired/Required received. Redirecting to subscription page...');
        window.location.href = '/subscription?status=expired';
      }
      return Promise.reject(error);
    }

    // Check if it's already a retry or if it's a 4xx error (which we shouldn't retry, e.g. 403/404)
    if (!config || config._retry || (error.response && error.response.status < 500)) {
      return Promise.reject(error);
    }
    
    config._retry = true; // Mark as retried
    console.warn(`API call failed: ${error.message}. Retrying once in 1s...`);
    
    // 1-second delay to settle transient glitches
    await new Promise(resolve => setTimeout(resolve, 1000));
    return api(config);
  }
);

export default api;
