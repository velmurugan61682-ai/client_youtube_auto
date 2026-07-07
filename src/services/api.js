import axios from 'axios';

// RUNTIME Dynamic Base URL detection
const getBaseURL = () => {
  // 1. Check if we have an explicit ENV variable (highest priority)
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace('/auth/google', '');
  
  // 2. Check if we are running on Vercel (production)
  const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  if (isProd) {
    // On Vercel, if VITE_API_URL is missing, we MUST have a relative path or error
    console.warn('⚠️ VITE_API_URL is missing. Attempting relative API path...');
    return window.location.origin; // Try to call the same domain
  }
  
  // 3. Fallback for Local Development
  return 'http://localhost:5000';
};

export const API_BASE_URL = getBaseURL().endsWith('/') ? getBaseURL().slice(0, -1) : getBaseURL();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000, // Increased to 60 seconds to accommodate Render backend cold start
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  console.log('Token exists:', !!token);

  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header attached');
  }

  return config;
});

// Response interceptor to handle auto-retry once on 5xx or network errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Check if it's already a retry or if it's a 4xx error (which we shouldn't retry, e.g. 401/403/404)
    if (!config || config._retry || (error.response && error.response.status < 500)) {
      return Promise.reject(error);
    }
    
    config._retry = true; // Mark as retried
    console.warn(`⚠️ API call failed: ${error.message}. Retrying once in 1s...`);
    
    // 1-second delay to settle transient glitches
    await new Promise(resolve => setTimeout(resolve, 1000));
    return api(config);
  }
);

export default api;
