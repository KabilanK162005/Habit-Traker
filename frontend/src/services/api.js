import axios from 'axios';

let baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';
if (baseURL && !baseURL.endsWith('/api')) {
  baseURL = baseURL.endsWith('/') ? `${baseURL}api` : `${baseURL}/api`;
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

console.log('API Base URL:', api.defaults.baseURL);
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('habit_flow_token');
  // Only add token if it exists and we are not calling auth endpoints
  if (token && !config.url.includes('/auth/')) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      localStorage.removeItem('habit_flow_token');
      localStorage.removeItem('habit_flow_user');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;