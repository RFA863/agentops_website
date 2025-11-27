import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Interceptor Request: Sisipkan Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // Pastikan token benar-benar string valid, bukan "undefined" atau "null" string
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor Response: Handle 401 (Auto Logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redirect hanya jika 401 Unauthorized DAN bukan sedang di halaman login/public
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && currentPath !== '/') {
        // Hapus token busuk dan tendang ke login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;