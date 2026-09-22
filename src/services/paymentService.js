import api from './api';

const BASE_PAYMENTS_URL = '/payments/';

export const fetchPayments = (params = {}) => api.get(BASE_PAYMENTS_URL, { params });
export const fetchPaymentById = (id) => api.get(`${BASE_PAYMENTS_URL}${id}/`);
export const createPayment = (data) => api.post(BASE_PAYMENTS_URL, data);
export const markPaymentPaid = (id) => api.post(`${BASE_PAYMENTS_URL}${id}/mark-paid/`);
export const updatePaymentStatus = (id, status) =>
  api.post(`${BASE_PAYMENTS_URL}${id}/update-status/`, { status });
