import { apiClient } from './client';

export async function fetchPlans() {
  const response = await apiClient.get('/plans');
  return response.data.data;
}

export async function createPlan(payload) {
  const response = await apiClient.post('/plans', payload);
  return response.data.data;
}

export async function updatePlan(planId, payload) {
  const response = await apiClient.put(`/plans/${planId}`, payload);
  return response.data.data;
}

export async function archivePlan(planId) {
  const response = await apiClient.patch(`/plans/${planId}/archive`);
  return response.data.data;
}

export async function deletePlan(planId) {
  const response = await apiClient.delete(`/plans/${planId}`);
  return response.data.data;
}
