import api from './client';

export async function fetchCompanies() {
  const response = await api.get('/api/companies');
  return response.data.data;
}

export async function createCompany(payload) {
  const response = await api.post('/api/companies', payload);
  return response.data.data;
}

export async function updateCompany(companyId, payload) {
  const response = await api.put(`/api/companies/${companyId}`, payload);
  return response.data.data;
}

export async function deleteCompany(companyId) {
  const response = await api.delete(`/api/companies/${companyId}`);
  return response.data.data;
}
