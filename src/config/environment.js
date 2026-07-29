/**
 * Senior Developer Grade Centralized Environment Configuration
 * Single Source of Truth for API endpoints, Socket.IO URLs, and Frontend URLs.
 */

const isProd = import.meta.env.PROD === true;

// Resolve API base URL (must end with /api without trailing slash)
const resolveApiBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '') {
    envUrl = isProd
      ? 'https://server-youtube-auto.onrender.com/api'
      : 'http://localhost:5000/api';
  }
  let cleanUrl = envUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl = `${cleanUrl}/api`;
  }
  return cleanUrl;
};

// Resolve Socket URL (backend origin without trailing slash or /api)
const resolveSocketUrl = () => {
  let envSocketUrl = import.meta.env.VITE_SOCKET_URL;
  if (!envSocketUrl || envSocketUrl.trim() === '') {
    envSocketUrl = isProd
      ? 'https://server-youtube-auto.onrender.com'
      : 'http://localhost:5000';
  }
  let cleanUrl = envSocketUrl.trim().replace(/\/+$/, '');
  return cleanUrl.replace(/\/api\/?$/, '');
};

// Resolve Frontend Base URL
const resolveFrontendUrl = () => {
  let envFrontendUrl = import.meta.env.VITE_FRONTEND_URL;
  if (!envFrontendUrl || envFrontendUrl.trim() === '') {
    envFrontendUrl = isProd
      ? 'https://channelbot.in'
      : 'http://localhost:5173';
  }
  return envFrontendUrl.trim().replace(/\/+$/, '');
};

export const API_BASE_URL = resolveApiBaseUrl();
export const SOCKET_URL = resolveSocketUrl();
export const FRONTEND_URL = resolveFrontendUrl();

export default {
  API_BASE_URL,
  SOCKET_URL,
  FRONTEND_URL
};
