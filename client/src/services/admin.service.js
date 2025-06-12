import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

class AdminService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/admin`,
      headers: { 'Content-Type': 'application/json' }
    });    // Request interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.accessToken = token;
      }
      return config;
    });

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        throw error.response?.data || error;
      }
    );
  }  // Dashboard & Statistics
  async getDashboardOverview() {
    return this.api.get('/dashboard/overview');
  }async getRevenueStats(period = 'month') {
    return this.api.get(`/statistics/revenue?period=${period}`);
  }  async getOrderStats(period = 'month') {
    return this.api.get(`/statistics/orders?period=${period}`);
  }
  async getProductStats() {
    return this.api.get('/statistics/products');
  }
  async getUserStats() {
    return this.api.get('/statistics/users');
  }

  async getRecentActivities() {
    return this.api.get('/activities/recent');
  }

  async getSystemAlerts() {
    return this.api.get('/alerts');
  }

  // User Management
  async getUsers(page = 1, limit = 10) {
    return this.api.get(`/users?page=${page}&limit=${limit}`);
  }

  async searchUsers(query, role = '', page = 1, limit = 10) {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    if (role) params.append('role', role);
    
    return this.api.get(`/users/search?${params}`);
  }

  async getUser(id) {
    return this.api.get(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.api.put(`/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.api.delete(`/users/${id}`);
  }

  // Product Management
  async getProducts(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);

    return this.api.get(`/products?${params}`);
  }

  async createProduct(productData) {
    return this.api.post('/products', productData);
  }

  async updateProduct(id, productData) {
    return this.api.put(`/products/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.api.delete(`/products/${id}`);
  }

  async bulkUpdateProducts(productIds, updates) {
    return this.api.post('/products/bulk-update', {
      productIds,
      updates,
    });
  }

  async bulkDeleteProducts(productIds) {
    return this.api.delete('/products/bulk-delete', {
      data: { productIds },
    });
  }

  // Order Management
  async getOrders(page = 1, limit = 10, status = '', startDate = '', endDate = '', search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (search) params.append('search', search);

    return this.api.get(`/orders?${params}`);
  }

  async updateOrderStatus(id, status) {
    return this.api.put(`/orders/${id}/status`, { status });
  }

  // Export & Reports
  async exportOrders(startDate = '', endDate = '', status = '') {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);

    const response = await this.api.get(`/export/orders?${params}`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response;
  }

  async getLogs() {
    return this.api.get('/logs');
  }
  // Utility methods
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('vi-VN');
  }
  
  formatDateTime(date) {
    return new Date(date).toLocaleString('vi-VN');
  }
}

export const adminService = new AdminService();
