import { apiClient } from './client';

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );
}

export async function fetchTasks(params = {}) {
  const response = await apiClient.get('/tasks', { params: compactParams(params) });
  return response.data.data;
}

export async function createTask(payload) {
  const response = await apiClient.post('/tasks', payload);
  return response.data.data;
}

export async function updateTask(taskId, payload) {
  const response = await apiClient.put(`/tasks/${taskId}`, payload);
  return response.data.data;
}

export async function completeTask(taskId) {
  const response = await apiClient.patch(`/tasks/${taskId}/complete`);
  return response.data.data;
}

export async function deleteTask(taskId) {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data.data;
}
