import { apiClient } from './client';

export async function fetchFocusSessions() {
  const response = await apiClient.get('/focus-sessions');
  return response.data.data;
}

export async function createFocusSession(payload) {
  const response = await apiClient.post('/focus-sessions', payload);
  return response.data.data;
}
