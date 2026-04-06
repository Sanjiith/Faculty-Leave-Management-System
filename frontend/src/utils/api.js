import axios from 'axios';

export const API_BASE_URL =  process.env.API_BASE_URL || 'https://faculty-leave-management-system-1n5r.onrender.com/api' ||'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
