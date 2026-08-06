import api from './client';

export async function fetchTodayCheckIn() {
  const response = await api.get('/api/checkins/today');
  return response.data.data;
}

export async function saveTodayCheckIn(payload) {
  const response = await api.put('/api/checkins/today', payload);
  return response.data.data;
}

export async function fetchRecentCheckIns() {
  const response = await api.get('/api/checkins/recent');
  return response.data.data;
}
