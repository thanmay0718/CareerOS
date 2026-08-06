import api from './client';

export async function fetchNotifications() {
  const response = await api.get('/api/notifications');
  return response.data.data;
}
