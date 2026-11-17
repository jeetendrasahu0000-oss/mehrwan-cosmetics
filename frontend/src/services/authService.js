import API from "./api";

export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  forgotPassword: (data) => API.post("/auth/forgot-password", data),
  resetPassword: (token, data) => API.put(`/auth/reset-password/${token}`, data),
  getProfile: () => API.get("/users/profile"),
  updateProfile: (data) => API.put("/users/profile", data),
  changePassword: (data) => API.put("/users/change-password", data),
};