import api from './api';

const BASE_DELIVERIES_URL = '/deliveries/';

export const fetchDeliveries = (params = {}) => api.get(BASE_DELIVERIES_URL, { params });
export const fetchDeliveryById = (id) => api.get(`${BASE_DELIVERIES_URL}${id}/`);
export const createDelivery = (data) => api.post(BASE_DELIVERIES_URL, data);
export const updateDeliveryStatus = (id, status) =>
  api.post(`${BASE_DELIVERIES_URL}${id}/update-status/`, { status });
