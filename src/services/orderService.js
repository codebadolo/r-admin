import api from './api';

const BASE_ORDERS_URL = '/orders/';
const BASE_ORDER_ITEMS_URL = '/order-items/';

// --- Orders ---
export const fetchOrders = (params = {}) => api.get(BASE_ORDERS_URL, { params });
export const fetchOrderById = (id) => api.get(`${BASE_ORDERS_URL}${id}/`);
export const createOrder = (data) => api.post(BASE_ORDERS_URL, data);
export const updateOrderStatus = (id, status) =>
  api.post(`${BASE_ORDERS_URL}${id}/update-status/`, { status });

// --- Order items ---
export const fetchOrderItems = (params = {}) => api.get(BASE_ORDER_ITEMS_URL, { params });
export const createOrderItem = (data) => api.post(BASE_ORDER_ITEMS_URL, data);
export const deleteOrderItem = (id) => api.delete(`${BASE_ORDER_ITEMS_URL}${id}/`);
