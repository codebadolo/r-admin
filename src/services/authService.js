import axios from 'axios';

// Instance axios configurée (optionnel)
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // URL de base de votre API Django
  headers: {
    'Content-Type': 'application/json',
  },
});

// API login : POST avec email et password
export const login = async (email, password) => {
  const response = await api.post('/users/login/', { email, password });
  return response.data; // { token, user: {...} }
};

// API logout : POST (envoie token dans header)
export const logout = async (token) => {
  const response = await api.post('/users/logout/', null, {
    headers: { Authorization: `Token ${token}` },
  });
  return response.data;
};
