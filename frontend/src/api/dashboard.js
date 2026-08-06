import api from './client';

export async function fetchDashboard() {
  const response = await api.get('/api/dashboard');
  return response.data.data;
}
