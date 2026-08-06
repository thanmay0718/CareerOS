import api from './client';

export async function fetchFocusSessions() {
  const response = await api.get('/api/focus-sessions');
  return response.data.data;
}

export async function createFocusSession(payload) {
  const response = await api.post('/api/focus-sessions', payload);
  return response.data.data;
}
