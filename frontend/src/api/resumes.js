import { apiClient } from './client';

export async function fetchResumes() {
  const response = await apiClient.get('/resumes');
  return response.data.data;
}

export async function createResume(payload) {
  const response = await apiClient.post('/resumes', payload);
  return response.data.data;
}

export async function updateResume(resumeId, payload) {
  const response = await apiClient.put(`/resumes/${resumeId}`, payload);
  return response.data.data;
}

export async function activateResume(resumeId) {
  const response = await apiClient.patch(`/resumes/${resumeId}/active`);
  return response.data.data;
}

export async function archiveResume(resumeId) {
  const response = await apiClient.patch(`/resumes/${resumeId}/archive`);
  return response.data.data;
}

export async function deleteResume(resumeId) {
  const response = await apiClient.delete(`/resumes/${resumeId}`);
  return response.data.data;
}
