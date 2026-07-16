import { apiClient } from './client';

export async function fetchRewardProfile() {
  const response = await apiClient.get('/rewards/profile');
  return response.data.data;
}
