import { apiClient } from './client';

export async function fetchCompanies() {
  const response = await apiClient.get('/companies');
  return response.data.data;
}

export async function createCompany(payload) {
  const response = await apiClient.post('/companies', payload);
  return response.data.data;
}

export async function updateCompany(companyId, payload) {
  const response = await apiClient.put(`/companies/${companyId}`, payload);
  return response.data.data;
}

export async function deleteCompany(companyId) {
  const response = await apiClient.delete(`/companies/${companyId}`);
  return response.data.data;
}
