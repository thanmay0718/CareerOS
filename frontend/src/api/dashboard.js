import { apiClient } from './client';

export async function fetchDashboard() {
  const response = await apiClient.get('/dashboard');
  return response.data.data;
}

