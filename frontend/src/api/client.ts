import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per afegir el token JWT persistent
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('yule_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor per gestionar sessions caducades
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si la sessió caduca i no estem a login, redirigim
      if (!window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('yule_auth_token');
        localStorage.removeItem('yule_user_profile');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
