/**
 * Centralized Production Application Environment Configuration
 * 
 * All API services, Socket.IO connections, authentication redirects, and endpoints
 * MUST import configuration from this single source of truth.
 */

const isProd = import.meta.env.PROD === true;

// Resolve API base URL (must end with /api without trailing slash)
const resolveApiBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL || '';
  if (!envUrl) {
    envUrl = isProd ? 'https://server-youtube-auto.onrender.com/api' : 'http://localhost:5000/api';
  }
  // Standardize trailing slashes & ensure /api path suffix
  let cleanUrl = envUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl = `${cleanUrl}/api`;
  }
  return cleanUrl;
};

// Resolve Socket URL (must be backend origin without /api)
const resolveSocketUrl = () => {
  let envSocketUrl = import.meta.env.VITE_SOCKET_URL || '';
  if (!envSocketUrl) {
    const apiBase = resolveApiBaseUrl();
    envSocketUrl = apiBase.replace(/\/api\/?$/, '');
  }
  let cleanUrl = envSocketUrl.trim().replace(/\/+$/, '');
  return cleanUrl.replace(/\/api\/?$/, '');
};

// Resolve Frontend URL
const resolveFrontendUrl = () => {
  let envFrontendUrl = import.meta.env.VITE_FRONTEND_URL || '';
  if (!envFrontendUrl) {
    envFrontendUrl = isProd ? 'https://channelbot.in' : 'http://localhost:5173';
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
