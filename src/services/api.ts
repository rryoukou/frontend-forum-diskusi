import axios from 'axios';

/**
 * Konfigurasi Dasar Axios untuk berkomunikasi dengan Backend API.
 */
const api = axios.create({
  // Ditambahkan fallback URL ke Render + /api agar aman jika env Vercel tidak terbaca
  baseURL: import.meta.env.VITE_API_URL || 'https://backend-forum-diskusi.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Interceptor Request: Menambahkan Token Autentikasi ke Header jika tersedia.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor Response: Menangani Error secara Global (misal: 401 Unauthorized).
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Jika token tidak valid atau expired, hapus data sesi dan redirect (opsional)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;