import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Interceptor Request: Sisipkan Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor Response: Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika 401 Unauthorized dan bukan sedang di halaman login/register
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && currentPath !== '/') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;