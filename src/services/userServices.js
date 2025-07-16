// src/services/userServices.js
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/users/users/";
const API_ROLE_URL = "http://127.0.0.1:8000/api/users/user-roles/";

// Ajout d’un header Authorization classique :
// Assurez-vous que le token est stocké correctement (ex: localStorage)
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Token ${token}` } : {};
}

// Users
export const fetchUsers = () =>
  axios.get(API_BASE_URL, { headers: getAuthHeaders() });

export const fetchUser = (id) =>
  axios.get(`${API_BASE_URL}${id}/`, { headers: getAuthHeaders() });

export const createUser = (data) =>
  axios.post(API_BASE_URL, data, { headers: getAuthHeaders() });

export const updateUser = (id, data) =>
  axios.put(`${API_BASE_URL}${id}/`, data, { headers: getAuthHeaders() });

export const deleteUser = (id) =>
  axios.delete(`${API_BASE_URL}${id}/`, { headers: getAuthHeaders() });

export const fetchPermissions = () =>
  axios.get("/api/users/permissions/", { headers: getAuthHeaders() });

export const updateUserPassword = (id, data) =>
  axios.post(`/api/users/users/${id}/change-password/`, data, { headers: getAuthHeaders() });
// Roles
export const fetchRoles = () =>
  axios.get(API_ROLE_URL, { headers: getAuthHeaders() });

export const fetchUserRoles = (userId) =>
  axios.get(`/api/users/user-roles/${userId}/`, { headers: getAuthHeaders() });

export const fetchRole = (id) =>
  axios.get(`${API_ROLE_URL}${id}/`, { headers: getAuthHeaders() });

export const createRole = (data) =>
  axios.post(API_ROLE_URL, data, { headers: getAuthHeaders() });

export const updateRole = (id, data) =>
  axios.put(`${API_ROLE_URL}${id}/`, data, { headers: getAuthHeaders() });

export const deleteRole = (id) =>
  axios.delete(`${API_ROLE_URL}${id}/`, { headers: getAuthHeaders() });

// Vous pouvez ajouter ici d’autres services comme UserRole, Permission, etc.
