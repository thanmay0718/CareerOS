import api from './client';

export async function fetchRoadmaps(params = {}) {
  const response = await api.get('/api/roadmaps', { params });
  return response.data.data;
}

export async function fetchRoadmapRecommendations(search) {
  const response = await api.get('/api/roadmaps/recommendations', { params: { search } });
  return response.data.data;
}

export async function createRoadmap(payload) {
  const response = await api.post('/api/roadmaps', payload);
  return response.data.data;
}

export async function updateRoadmap(roadmapId, payload) {
  const response = await api.put(`/api/roadmaps/${roadmapId}`, payload);
  return response.data.data;
}

export async function deleteRoadmap(roadmapId) {
  const response = await api.delete(`/api/roadmaps/${roadmapId}`);
  return response.data.data;
}

export async function updateRoadmapStatus(roadmapId, status) {
  const response = await api.patch(`/api/roadmaps/${roadmapId}/status/${status}`);
  return response.data.data;
}

export async function updateRoadmapModule(roadmapId, moduleId, payload) {
  const response = await api.put(`/api/roadmaps/${roadmapId}/modules/${moduleId}`, payload);
  return response.data.data;
}
