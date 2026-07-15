import { apiClient } from './client';

export async function fetchRoadmaps() {
  const response = await apiClient.get('/roadmaps');
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
