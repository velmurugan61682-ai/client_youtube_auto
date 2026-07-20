import api from '../api.js';

export const getRules = async (channelId = '') => {
  const response = await api.get(`/auto-mod/rules${channelId ? `?channelId=${channelId}` : ''}`);
  return response.data;
};

export const createRule = async (data) => {
  const response = await api.post('/auto-mod/rules', data);
  return response.data;
};

export const getRuleDetails = async (id) => {
  const response = await api.get(`/auto-mod/rules/${id}`);
  return response.data;
};

export const updateRule = async (id, data) => {
  const response = await api.patch(`/auto-mod/rules/${id}`, data);
  return response.data;
};

export const deleteRule = async (id) => {
  const response = await api.delete(`/auto-mod/rules/${id}`);
  return response.data;
};

export const updateRuleStatus = async (id, status) => {
  const response = await api.patch(`/auto-mod/rules/${id}/status`, { status });
  return response.data;
};

export const testRule = async (id, commentText) => {
  const response = await api.post(`/comment-automation/rules/${id}/test`, { commentText });
  return response.data;
};

export const getHistory = async (params) => {
  const response = await api.get('/auto-mod/history', { params });
  return response.data;
};

export const retryReply = async (logId) => {
  const response = await api.post(`/comment-automation/history/${logId}/retry`);
  return response.data;
};

export const getModerationLogs = async (params) => {
  const response = await api.get('/comment-automation/moderation', { params });
  return response.data;
};

export const executeModerationAction = async (logId, action) => {
  const response = await api.post(`/comment-automation/moderation/${logId}/action`, { action });
  return response.data;
};

export const getCommentAutomationStats = async (channelId = '') => {
  const response = await api.get(`/comment-automation/stats${channelId ? `?channelId=${channelId}` : ''}`);
  return response.data;
};

export const getCommentHistory = async (params) => {
  const response = await api.get('/comment-history', { params });
  return response.data;
};

