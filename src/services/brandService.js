// src/services/brandService.js
import api from './api';

export const fetchBrands = () => api.get('/brands/');
export const createBrand = (data) => api.post('/brands/', data);
