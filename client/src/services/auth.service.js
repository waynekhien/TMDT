import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Login method
  async login(username, password) {
    try {
      const response = await this.api.post(API_ENDPOINTS.AUTH.LOGIN, {
        username: username.trim(),
        password: password.trim()
      });
      
      if (response.data.accessToken && response.data.user) {
        // Store token and user info
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('username', response.data.user.username);
        localStorage.setItem('id', response.data.user.id.toString());
        localStorage.setItem('role', response.data.user.role);
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.accessToken
        };
      } else {
        throw new Error('Invalid server response');
      }
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Lỗi xác thực từ server');
    }
  }

  // Register method
  async register(username, email, password) {
    try {
      const response = await this.api.post(API_ENDPOINTS.AUTH.REGISTER, {
        username,
        email,
        password
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Registration failed');
    }
  }

  // Logout method
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    localStorage.removeItem('id');
    localStorage.removeItem('role');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  // Get current user info
  getCurrentUser() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    return {
      id: localStorage.getItem('id'),
      username: localStorage.getItem('username'),
      role: localStorage.getItem('role'),
      token
    };
  }
  // Verify token validity
  async verifyToken() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;

      const response = await this.api.get(API_ENDPOINTS.AUTH.VERIFY, {
        headers: { accessToken: token }
      });
      return response.data.valid;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // Change password method
  async changePassword(oldPassword, newPassword) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Vui lòng đăng nhập lại');
      }

      const response = await this.api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim()
      }, {
        headers: { accessToken: token }
      });

      return {
        success: true,
        message: response.data.message || 'Đổi mật khẩu thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Có lỗi xảy ra khi đổi mật khẩu'
      };
    }
  }
}

export const authService = new AuthService();
export default authService;