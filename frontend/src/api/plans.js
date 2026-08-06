import api from './client';

export async function fetchPlans() {
  const response = await api.get('/api/plans');
  return response.data.data;
}

export async function createPlan(payload) {
  const response = await api.post('/api/plans', payload);
  return response.data.data;
}

export async function updatePlan(planId, payload) {
  const response = await api.put(`/api/plans/${planId}`, payload);
  return response.data.data;
}

export async function archivePlan(planId) {
  const response = await api.patch(`/api/plans/${planId}/archive`);
  return response.data.data;
}

export async function deletePlan(planId) {
  const response = await api.delete(`/api/plans/${planId}`);
  return response.data.data;
}
