import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://mehrwan-cosmetics-backend.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("mehrwan_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;