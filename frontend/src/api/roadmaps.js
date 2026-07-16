import { apiClient } from './client';

export async function fetchRoadmaps(params = {}) {
  const response = await apiClient.get('/roadmaps', { params });
  return response.data.data;
}

export async function fetchRoadmapRecommendations(search) {
  const response = await apiClient.get('/roadmaps/recommendations', { params: { search } });
  return response.data.data;
}

export async function createRoadmap(payload) {
  const response = await apiClient.post('/roadmaps', payload);
  return response.data.data;
}

export async function updateRoadmap(roadmapId, payload) {
  const response = await apiClient.put(`/roadmaps/${roadmapId}`, payload);
  return response.data.data;
}

export async function deleteRoadmap(roadmapId) {
  const response = await apiClient.delete(`/roadmaps/${roadmapId}`);
  return response.data.data;
}

export async function updateRoadmapStatus(roadmapId, status) {
  const response = await apiClient.patch(`/roadmaps/${roadmapId}/status/${status}`);
  return response.data.data;
}

export async function updateRoadmapModule(roadmapId, moduleId, payload) {
  const response = await apiClient.put(`/roadmaps/${roadmapId}/modules/${moduleId}`, payload);
  return response.data.data;
}
