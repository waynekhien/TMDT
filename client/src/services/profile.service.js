import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

// Create axios instance for profile service
const profileAPI = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
profileAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.accessToken = token;
  }
  return config;
});

// Response interceptor for error handling
profileAPI.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    throw error.response?.data || error;
  }
);

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await profileAPI.get('/users/profile');
    return response;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await profileAPI.put('/users/profile', profileData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await profileAPI.put('/users/change-password', passwordData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Upload avatar (if needed in the future)
export const uploadAvatar = async (avatarFile) => {
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const response = await profileAPI.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
};
