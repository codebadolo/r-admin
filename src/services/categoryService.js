// src/services/categoryService.js
import api from './api';

export const fetchCategories = () => api.get('/categories/');
export const createCategory = (data) => api.post('/categories/', data);
