import API from "./api";

export const orderAPI = {
  create: (data) => API.post("/orders", data),
  getMyOrders: () => API.get("/orders/myorders"),
  getById: (id) => API.get(`/orders/${id}`),
  createRazorpayOrder: (amount) => API.post("/payment/create-order", { amount }),
  verifyPayment: (data) => API.post("/payment/verify", data),
};

export const cartAPI = {
  get: () => API.get("/cart"),
  add: (data) => API.post("/cart", data),
  update: (data) => API.put("/cart", data),
  remove: (productId) => API.delete(`/cart/${productId}`),
  applyCoupon: (code) => API.post("/cart/apply-coupon", { code }),
  clear: () => API.delete("/cart"),
};

export const wishlistAPI = {
  get: () => API.get("/wishlist"),
  toggle: (productId) => API.post("/wishlist/toggle", { productId }),
};