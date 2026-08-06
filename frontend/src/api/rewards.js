import api from './client';

export async function fetchRewardProfile() {
  const response = await api.get('/api/rewards/profile');
  return response.data.data;
}
