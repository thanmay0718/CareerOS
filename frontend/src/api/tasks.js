import api from './client';

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );
}

export async function fetchTasks(params = {}) {
  const response = await api.get('/api/tasks', { params: compactParams(params) });
  return response.data.data;
}

export async function createTask(payload) {
  const response = await api.post('/api/tasks', payload);
  return response.data.data;
}

export async function updateTask(taskId, payload) {
  const response = await api.put(`/api/tasks/${taskId}`, payload);
  return response.data.data;
}

export async function completeTask(taskId) {
  const response = await api.patch(`/api/tasks/${taskId}/complete`);
  return response.data.data;
}

export async function missTask(taskId, payload) {
  const response = await api.patch(`/api/tasks/${taskId}/missed`, payload);
  return response.data.data;
}

export async function rescheduleTask(taskId, payload) {
  const response = await api.patch(`/api/tasks/${taskId}/reschedule`, payload);
  return response.data.data;
}

export async function fetchTaskTimeline() {
  const response = await api.get('/api/tasks/timeline');
  return response.data.data;
}

export async function fetchMissedTaskInsights() {
  const response = await api.get('/api/tasks/missed-insights');
  return response.data.data;
}

export async function deleteTask(taskId) {
  const response = await api.delete(`/api/tasks/${taskId}`);
  return response.data.data;
}
