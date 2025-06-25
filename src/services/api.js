import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // adapte si besoin
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Vérifie si c'est 'Token' ou 'Bearer' selon ton backend Django
      config.headers.Authorization = `Token ${token}`;
      // Si ça ne marche pas, essaie : config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
