import axios from 'axios';
import { clearAuthSession, readAuthSession } from './storage';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const session = readAuthSession();
  const token = session?.token;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthSession();
      window.dispatchEvent(new CustomEvent('careeros:auth-expired'));
    }

    return Promise.reject(error);
  },
);

