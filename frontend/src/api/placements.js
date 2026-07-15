import { apiClient } from './client';

export async function fetchPlacements() {
  const response = await apiClient.get('/placements');
  return response.data.data;
}

export async function createPlacement(payload) {
  const response = await apiClient.post('/placements', payload);
  return response.data.data;
}

export async function updatePlacement(applicationId, payload) {
  const response = await apiClient.put(`/placements/${applicationId}`, payload);
  return response.data.data;
}

export async function deletePlacement(applicationId) {
  const response = await apiClient.delete(`/placements/${applicationId}`);
  return response.data.data;
}
