import api from './api';

const BASE_URL = '/quotes/';

export const fetchQuotes = () => api.get(BASE_URL);
export const fetchQuoteById = (id) => api.get(`${BASE_URL}${id}/`);
export const respondToQuote = (id, data) => api.post(`${BASE_URL}${id}/respond/`, data);
