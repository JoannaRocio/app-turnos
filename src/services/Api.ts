import axios from 'axios';
import AuthService from './AuthService';

const Api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

Api.interceptors.request.use((config) => {
  const token = AuthService.getToken();

  if (!config.headers) {
    config.headers = {};
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

Api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || '';
    const status = error?.response?.status;

    const isExpiredToken = status === 500 && message.includes('JWT expired');
    const isUnauthorized = status === 401;

    if (isExpiredToken || isUnauthorized) {
      alert('Tu sesión expiró. Por favor, iniciá sesión nuevamente.');
      AuthService.logout();
      window.location.href = '/Inicio-sesion';
    }

    return Promise.reject(error);
  }
);

export default Api;
