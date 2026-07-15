import { apiClient } from './client';

export async function fetchNotifications() {
  const response = await apiClient.get('/notifications');
  return response.data.data;
}
