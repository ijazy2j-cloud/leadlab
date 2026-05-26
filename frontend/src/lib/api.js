import axios from 'axios';
import { getCurrentUserId } from './auth';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const userId = getCurrentUserId();
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  return config;
});

export default api;
