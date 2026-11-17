import API from "./api";

export const adminAPI = {
  getStats: () => API.get("/dashboard/stats"),
  // Products
  createProduct: (data) => API.post("/products", data),
  updateProduct: (id, data) => API.put(`/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/products/${id}`),
  // Categories
  getAllCategories: () => API.get("/categories/all"),
  createCategory: (data) => API.post("/categories", data),
  updateCategory: (id, data) => API.put(`/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/categories/${id}`),
  // Orders
  getAllOrders: () => API.get("/orders"),
  updateOrderStatus: (id, status) => API.put(`/orders/${id}/status`, { status }),
  // Users
  getAllUsers: () => API.get("/users"),
  toggleBlockUser: (id) => API.put(`/users/${id}/block`),
  // Coupons
  getCoupons: () => API.get("/coupons"),
  createCoupon: (data) => API.post("/coupons", data),
  updateCoupon: (id, data) => API.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => API.delete(`/coupons/${id}`),
  // Reviews
  getAllReviews: () => API.get("/reviews"),
  approveReview: (id) => API.put(`/reviews/${id}/approve`),
  deleteReview: (id) => API.delete(`/reviews/${id}`),
  // Banners
  getAllBanners: () => API.get("/banners/all"),
  createBanner: (data) => API.post("/banners", data),
  updateBanner: (id, data) => API.put(`/banners/${id}`, data),
  deleteBanner: (id) => API.delete(`/banners/${id}`),
  // Upload
  uploadImages: (formData) =>
    API.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};