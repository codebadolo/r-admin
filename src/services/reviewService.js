import api from './api';

const BASE_URL = '/reviews/';

export const fetchReviews = () => api.get(BASE_URL);
export const approveReview = (id) => api.patch(`${BASE_URL}${id}/`, { is_approved: true });
export const deleteReview = (id) => api.delete(`${BASE_URL}${id}/`);
