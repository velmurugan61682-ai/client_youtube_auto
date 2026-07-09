import axios from 'axios';

// RUNTIME Base URL detection
const getBaseURL = () => {
  // If we are in production mode, strictly use the Render production backend URL
  if (import.meta.env.PROD === true) {
    return 'https://server-youtube-automation.onrender.com';
  }
  
  // Fallback for Local Development
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

export const API_BASE_URL = getBaseURL().endsWith('/') ? getBaseURL().slice(0, -1) : getBaseURL();

console.log(`✓ Production API URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000, // 60 seconds
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auto-retry once on 5xx or network errors
let apiConnectedLogged = false;
api.interceptors.response.use(
  (response) => {
    if (!apiConnectedLogged) {
      console.log('✓ API Connected');
      apiConnectedLogged = true;
    }
    return response;
  },
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
