import api from './api';  // votre instance axios configurée
// import axios from 'axios'  // Non nécessaire si vous utilisez api.js personnalisé

const BASE_USERS_URL = '/users/users/';          // API utilisateurs
const BASE_USER_ROLES_URL = '/users/user-roles/'; // API rôles utilisateurs
const BASE_PERMISSIONS_URL = '/permissions/';     // API permissions
const BASE_ROLES_URL = '/users/roles/';

// Utilisateurs
export const fetchUsers = () => api.get(BASE_USERS_URL);

export const fetchUser = (id) => api.get(`${BASE_USERS_URL}${id}/`);

export const createUser = (data) => api.post(BASE_USERS_URL, data);

export const updateUser = (id, data) => api.put(`${BASE_USERS_URL}${id}/`, data);

export const deleteUser = (id) => api.delete(`${BASE_USERS_URL}${id}/`);

export const updateUserPassword = (id, data) =>
  api.post(`${BASE_USERS_URL}${id}/change-password/`, data);

// Rôles utilisateurs (lister, créer, modifier, supprimer)
export const fetchRoles = () => api.get(BASE_USER_ROLES_URL);

export const fetchUserRoles = (userId) => api.get(`${BASE_USER_ROLES_URL}?user=${userId}`);
// Note : dans votre backend, la route exacte pour rôles utilisateurs liés à un user peut varier. 
// Ici on suppose un filtre par query param 'user', adaptez si besoin.

export const fetchRole = (id) => api.get(`${BASE_USER_ROLES_URL}${id}/`);

export const createRole = (data) => api.post(BASE_ROLES_URL, data);

export const updateRole = (id, data) => api.put(`${BASE_ROLES_URL}${id}/`, data);

export const deleteRole = (id) => api.delete(`${BASE_USER_ROLES_URL}${id}/`);
export function fetchCurrentUser() {
  return api.get("/users/me/");
}
// Permissions
export const fetchPermissions = () => api.get(BASE_PERMISSIONS_URL);
export const fetchPays = () => api.get('/users/pays/');
export const fetchFormesJuridiques = () => api.get('/users/formejuridiques/');
export const fetchRegimesFiscaux = () => api.get('/users/regimefiscaux/');
export const fetchDivisionsFiscales = () => api.get('/users/divisionfiscales/');
// Numéros TVA d’un utilisateur
export const fetchUserTVANumbers = (userId) =>
  api.get(`/users/usertvanumbers/?utilisateur=${userId}`);
// Assurez-vous que cette route est correctement exposée dans votre backend



// Changer mot de passe (adapté selon votre backend)
export function changePassword(data) {
  return api.post("/users/password/change/", data);
}

const BASE_ADRESSES_URL = '/users/adresses/';

export const fetchAddresses = () => api.get(BASE_ADRESSES_URL);

export const createAddress = (data) => api.post(BASE_ADRESSES_URL, data);

export const updateAddress = (id, data) => api.put(`${BASE_ADRESSES_URL}${id}/`, data);

export const deleteAddress = (id) => api.delete(`${BASE_ADRESSES_URL}${id}/`);