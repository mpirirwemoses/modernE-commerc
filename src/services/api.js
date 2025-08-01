import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please wait before making more requests.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getOnSale: () => api.get('/products/on-sale'),
  search: (query) => api.get('/products', { params: { search: query } }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  getHierarchy: () => api.get('/categories/hierarchy'),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateQuantity: (id, data) => api.put(`/cart/${id}`, data),
  removeFromCart: (id) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart'),
  getSummary: () => api.get('/cart/summary'),
  syncCart: (items) => api.post('/cart/sync', { items }),
};

// Orders API
export const ordersAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  cancelOrder: (id, data) => api.put(`/orders/${id}/cancel`, data),
  getCancelledOrders: (params) => api.get('/orders/admin/cancelled', { params }),
  processRefund: (id, data) => api.post(`/orders/${id}/refund`, data),
};

// Payments API
export const paymentsAPI = {
  createIntent: (data) => api.post('/payments/create-intent', data),
  processStripe: (data) => api.post('/payments/stripe', data),
  createPayPal: (data) => api.post('/payments/paypal/create', data),
  executePayPal: (data) => api.post('/payments/paypal/execute', data),
  processMobileMoney: (data) => api.post('/payments/mobile-money', data),
  getPaymentStatus: (id) => api.get(`/payments/${id}/status`),
  getPaymentHistory: (params) => api.get('/payments/history', { params }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  getOrders: (params) => api.get('/users/orders', { params }),
  getReviews: (params) => api.get('/users/reviews', { params }),
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId, params) => 
    api.get(`/reviews/product/${productId}`, { params }),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getReviewStats: (productId) => api.get(`/reviews/stats/${productId}`),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (data) => api.post('/wishlist', data),
  removeFromWishlist: (id) => api.delete(`/wishlist/${id}`),
  clearWishlist: () => api.delete('/wishlist'),
  checkWishlist: (productId) => api.get(`/wishlist/check/${productId}`),
  moveToCart: (id, data) => api.post(`/wishlist/${id}/move-to-cart`, data),
};

// Coupons API
export const couponsAPI = {
  validateCoupon: (data) => api.post('/coupons/validate', data),
  applyCoupon: (data) => api.post('/coupons/apply', data),
};

export default api; 