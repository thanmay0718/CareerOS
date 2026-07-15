import { apiClient } from './client';

export async function fetchTodayCheckIn() {
  const response = await apiClient.get('/checkins/today');
  return response.data.data;
}

export async function saveTodayCheckIn(payload) {
  const response = await apiClient.put('/checkins/today', payload);
  return response.data.data;
}

export async function fetchRecentCheckIns() {
  const response = await apiClient.get('/checkins/recent');
  return response.data.data;
}
