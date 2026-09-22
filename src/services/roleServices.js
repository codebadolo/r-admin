// roleServices.js
import axios from "axios";

const token = localStorage.getItem("token");
const config = {
  headers: { Authorization: `Token ${token}` },
};

export const fetchRoles = () =>
  axios.get(`http://127.0.0.1:8004/api/users/user-roles/`, config).then(res => res.data);
