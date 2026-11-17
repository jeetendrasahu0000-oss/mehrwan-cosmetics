import API from "./api";

export const productAPI = {
  getAll: (params) => API.get("/products", { params }),
  getById: (id) => API.get(`/products/${id}`),
  getRelated: (id) => API.get(`/products/${id}/related`),
  getCategories: () => API.get("/categories"),
  getBanners: (type) => API.get("/banners", { params: { type } }),
  getReviews: (productId) => API.get(`/reviews/product/${productId}`),
  createReview: (data) => API.post("/reviews", data),
};