import axios from 'axios';
import { clearAuthSession, readAuthSession } from './storage';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('Missing required VITE_API_BASE_URL environment variable.');
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const session = readAuthSession();
  const token = session?.token;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthSession();
      window.dispatchEvent(new CustomEvent('careeros:auth-expired'));
    }

    return Promise.reject(error);
  },
);

export default api;
