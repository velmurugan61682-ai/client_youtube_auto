import api from '../api';

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
