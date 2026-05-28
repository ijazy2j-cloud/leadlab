import axios from 'axios';
import { LOGOUT_URL } from './auth';

const api = axios.create({
  baseURL: '/api',
});

// On SSO session expiry the backend returns 401. Redirect to the SSO logout page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = LOGOUT_URL;
    }
    return Promise.reject(error);
  }
);

export default api;
