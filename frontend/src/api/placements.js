import api from './client';

export async function fetchPlacements() {
  const response = await api.get('/api/placements');
  return response.data.data;
}

export async function createPlacement(payload) {
  const response = await api.post('/api/placements', payload);
  return response.data.data;
}

export async function updatePlacement(applicationId, payload) {
  const response = await api.put(`/api/placements/${applicationId}`, payload);
  return response.data.data;
}

export async function deletePlacement(applicationId) {
  const response = await api.delete(`/api/placements/${applicationId}`);
  return response.data.data;
}
