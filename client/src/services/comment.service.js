import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

const API_URL = `${API_BASE_URL}${API_ENDPOINTS.COMMENTS.CREATE}`;

// Get comments for a specific product
export const getCommentsByProduct = async (productId, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COMMENTS.GET_BY_PRODUCT}/${productId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a new comment
export const createComment = async (commentData) => {
  try {
    const response = await axios.post(API_URL, commentData, {
      headers: {
        accessToken: localStorage.getItem('accessToken')
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update a comment
export const updateComment = async (commentId, commentData) => {
  try {
    const response = await axios.put(`${API_URL}/${commentId}`, commentData, {
      headers: {
        accessToken: localStorage.getItem('accessToken')
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
  try {
    const response = await axios.delete(`${API_URL}/${commentId}`, {
      headers: {
        accessToken: localStorage.getItem('accessToken')
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
