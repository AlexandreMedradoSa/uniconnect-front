import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token automaticamente
apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptores para lidar com tokens expirados ou inválidos
apiClient.interceptors.response.use(
  (response) => response, // Retorna a resposta normalmente
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      // Token expirado ou inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token'); // Remove o token do localStorage
        window.location.href = '/'; // Redireciona para a página inicial
      }
    }

    return Promise.reject(error); // Rejeita a promise para lidar com outros erros
  },
);

export default apiClient;
