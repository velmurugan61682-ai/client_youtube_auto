import api from '../api.js';

const BASE = '/api-keys';

/**
 * Returns auth headers using adminToken if present, else regular token.
 * This is needed because the API interceptor only sends adminToken for /admin/* URLs.
 */
const authHeaders = () => {
  const adminToken = localStorage.getItem('adminToken');
  const token = localStorage.getItem('token');
  const activeToken = (adminToken && adminToken !== 'null' && adminToken !== 'undefined')
    ? adminToken
    : token;
  return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
};

/**
 * Get all API keys for the authenticated user (keys are masked).
 */
export const getApiKeys = () =>
  api.get(BASE, { headers: authHeaders() });

/**
 * Create a new API key.
 */
export const createApiKey = (payload) =>
  api.post(BASE, payload, { headers: authHeaders() });

/**
 * Update an existing API key (name, description, permissions, rateLimit, expiresAt, isActive).
 */
export const updateApiKey = (id, payload) =>
  api.put(`${BASE}/${id}`, payload, { headers: authHeaders() });

/**
 * Permanently delete (revoke) an API key.
 */
export const deleteApiKey = (id) =>
  api.delete(`${BASE}/${id}`, { headers: authHeaders() });

/**
 * Get current usage statistics for a specific key.
 */
export const getApiKeyStats = (id) =>
  api.get(`${BASE}/${id}/stats`, { headers: authHeaders() });
