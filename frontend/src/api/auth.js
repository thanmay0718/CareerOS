import api from './client';

export async function registerUser(payload) {
  const response = await api.post('/api/auth/register', payload);
  return response.data.data;
}

export async function loginUser(payload) {
  const response = await api.post('/api/auth/login', payload);
  return response.data.data;
}
