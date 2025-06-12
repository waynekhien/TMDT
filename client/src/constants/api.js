// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    CHANGE_PASSWORD: '/api/auth/changepassword'
  },
  PRODUCTS: {
    GET_ALL: '/api/products',
    GET_BY_ID: '/api/products',
    SEARCH: '/api/products/search',
    BY_CATEGORY: '/api/products/category',
    CATEGORIES: '/api/products/categories/list'
  },
  CART: {
    GET: '/api/cart',
    ADD_ITEM: '/api/cart/items',
    UPDATE_ITEM: '/api/cart/items',
    REMOVE_ITEM: '/api/cart/items',
    CLEAR: '/api/cart'
  },  ORDERS: {
    CREATE: '/api/orders',
    GET_ALL: '/api/orders',
    GET_BY_ID: '/api/orders',
    CANCEL: '/api/orders'
  },
  USERS: {
    PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password'
  },
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    PRODUCTS: '/api/admin/products',
    ORDERS: '/api/admin/orders',
    USERS: '/api/admin/users',
    STATISTICS: '/api/admin/statistics',
    CHECK_STATUS: '/api/admin/check-status'
  },
  COMMENTS: {
    GET_BY_PRODUCT: '/api/comments/product',
    CREATE: '/api/comments',
    UPDATE: '/api/comments',
    DELETE: '/api/comments'
  }
};


// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
};

// Response Status Codes
export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};
