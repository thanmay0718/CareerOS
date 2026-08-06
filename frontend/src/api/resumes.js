import api from './client';

export async function fetchResumes() {
  const response = await api.get('/api/resumes');
  return response.data.data;
}

export async function createResume(payload) {
  const response = await api.post('/api/resumes', payload);
  return response.data.data;
}

export async function updateResume(resumeId, payload) {
  const response = await api.put(`/api/resumes/${resumeId}`, payload);
  return response.data.data;
}

export async function activateResume(resumeId) {
  const response = await api.patch(`/api/resumes/${resumeId}/active`);
  return response.data.data;
}

export async function archiveResume(resumeId) {
  const response = await api.patch(`/api/resumes/${resumeId}/archive`);
  return response.data.data;
}

export async function deleteResume(resumeId) {
  const response = await api.delete(`/api/resumes/${resumeId}`);
  return response.data.data;
}
