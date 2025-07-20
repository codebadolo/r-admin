import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // adapt if needed
  // DO NOT set default headers here — axios will auto-set Content-Type
});

// Interceptor to add the token dynamically on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // make sure this matches your storage key
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      // If your backend expects 'Bearer' prefix instead, replace with:
      // config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
