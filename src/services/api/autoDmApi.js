import api from '../api.js';

export const getAutoDmConfig = async (videoId) => {
  const response = await api.get(`/auto-dm/config/${videoId}`);
  return response.data;
};

export const saveAutoDmConfig = async (data) => {
  const response = await api.post('/auto-dm/config', data);
  return response.data;
};

export const getAutoDmStats = async (videoId) => {
  const response = await api.get(`/auto-dm/stats/${videoId}`);
  return response.data;
};

export const getAutoDmHistory = async (videoId, page = 1, limit = 10) => {
  const response = await api.get(`/auto-dm/history/${videoId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const triggerAutoDmRun = async (videoId) => {
  const response = await api.post(`/auto-dm/run/${videoId}`);
  return response.data;
};

// FIX #5: Atomic keyword add/remove — uses $addToSet/$pull on the backend
// to prevent the full-array-overwrite bug that deleted existing keywords.
export const addKeyword = async (videoId, keyword) => {
  const response = await api.post('/auto-dm/keywords/add', { videoId, keyword });
  return response.data; // { keywords: [...] }
};

export const removeKeyword = async (videoId, keyword) => {
  const response = await api.post('/auto-dm/keywords/remove', { videoId, keyword });
  return response.data; // { keywords: [...] }
};
