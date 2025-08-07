import api from './api';

const USERS_URL = "/users/users/";  // si route correctement exposée ainsi

const USER_ROLES_URL = 'users/user-roles/';
const PERMISSIONS_URL = '/permissions/';

export const fetchUsers = () => api.get('/users/users/');


export const fetchUser = id => api.get(`${USERS_URL}${id}/`);

export const createUser = data => api.post(USERS_URL, data);

export const updateUser = (id, data) => api.put(`${USERS_URL}${id}/`, data);

export const deleteUser = id => api.delete(`${USERS_URL}${id}/`);

export const fetchPermissions = () => api.get(PERMISSIONS_URL);

export const updateUserPassword = (id, data) =>
  api.post(`${USERS_URL}${id}/change-password/`, data);

export const fetchRoles = () => api.get(USER_ROLES_URL);

export const fetchUserRoles = userId => api.get(`${USER_ROLES_URL}${userId}/`);

export const fetchRole = id => api.get(`${USER_ROLES_URL}${id}/`);

export const createRole = data => api.post(USER_ROLES_URL, data);

export const updateRole = (id, data) => api.put(`${USER_ROLES_URL}${id}/`, data);

export const deleteRole = id => api.delete(`${USER_ROLES_URL}${id}/`);
