import api from './api';

const BASE_URL = '/promotions/';

export const fetchPromotions = () => api.get(BASE_URL);
export const createPromotion = (data) => api.post(BASE_URL, data);
export const updatePromotion = (id, data) => api.put(`${BASE_URL}${id}/`, data);
export const deletePromotion = (id) => api.delete(`${BASE_URL}${id}/`);
