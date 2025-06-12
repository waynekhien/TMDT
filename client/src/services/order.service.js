import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

const API_URL = `${API_BASE_URL}/api/orders`;

// Tạo đơn hàng mới
export const createOrder = async (orderData) => {
  try {
    console.log('Creating order with data:', orderData);
    const token = localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No access token found');
    }

    const response = await axios.post(API_URL, orderData, {
      headers: {
        'accessToken': token,
        'Content-Type': 'application/json'
      }
    });

    console.log('Order creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Order creation error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);

    if (error.response?.data) {
      throw error.response.data;
    } else {
      throw { error: error.message || 'Failed to create order' };
    }
  }
};

// Lấy danh sách đơn hàng của user
export const getUserOrders = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(API_URL, {
      headers: {
        'accessToken': token
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Lấy chi tiết đơn hàng
export const getOrderById = async (orderId) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/${orderId}`, {
      headers: {
        'accessToken': token
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Hủy đơn hàng
export const cancelOrder = async (orderId) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.put(`${API_URL}/${orderId}/cancel`, {}, {
      headers: {
        'accessToken': token
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;  }
};

// Xóa đơn hàng
export const deleteOrder = async (orderId) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.delete(`${API_URL}/${orderId}`, {
      headers: {
        'accessToken': token
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const orderService = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  deleteOrder
};

export default orderService;
