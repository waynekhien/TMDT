import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

const API_URL = `${API_BASE_URL}/api/products`;

// Lấy danh sách tất cả sản phẩm với phân trang
export const getProducts = async (params = {}) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'id', order = 'ASC' } = params;
    const response = await axios.get(API_URL, {
      params: {
        page,
        limit,
        search,
        sortBy,
        order
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Lấy chi tiết sản phẩm theo ID
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Lấy sản phẩm theo danh mục
export const getProductsByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/category/${category}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Tìm kiếm sản phẩm
export const searchProducts = async (query) => {
  try {
    // Đảm bảo URL được xử lý đúng
    const fullUrl = `${API_URL}/search`;
    
    const response = await axios({
      method: 'GET',
      url: fullUrl,
      params: { q: query }
    });
    
    return response.data;
  } catch (error) {
    console.error('Search error:', error); // Log chi tiết lỗi
    throw error.response?.data || error.message;
  }
};

// Lấy danh sách danh mục
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories/list`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const productService = {
  getProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getCategories
};

export default productService;
