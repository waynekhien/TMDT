import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import axios from 'axios';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { showSuccess, showError } = useUI();
  const { id, title, price, thumbnail, brand, discountPercentage } = product;
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formatPrice = (price) => {
    try {
      return `${Number(price || 0).toFixed(2)} USD`;
    } catch (error) {
      return '0.00 USD';
    }
  };
  const formatDiscount = (price, discount) => {
    try {
      return `${(Number(price || 0) * (100 + Number(discount || 0)) / 100).toFixed(2)} USD`;
    } catch (error) {
      return '0.00 USD';
    }
  };
  const handleAddToCart = async () => {
    if (!authState.status) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CART.ADD_ITEM}`, 
        { productId: id, quantity: 1 },
        { headers: { accessToken: localStorage.getItem('accessToken') } }
      );      // Use a more user-friendly notification instead of alert
      showSuccess('Sản phẩm đã được thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      showError('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
    >
      <div className="product-image">
        <img src={thumbnail} alt={title} />
        {discountPercentage > 0 && (
          <motion.span
            className="discount-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            -{discountPercentage.toFixed(0)}%
          </motion.span>
        )}
        <div className="product-overlay">
          <Link to={`/products/${id}`} className="quick-view">
            <Eye size={20} />
            <span>Quick View</span>
          </Link>
        </div>
      </div>

      <div className="product-info">
        <div className="product-header">
          <h3 className="product-title">{title}</h3>
          <p className="product-brand">{brand}</p>
        </div>

        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={`star ${i < 4 ? 'filled' : ''}`}
              fill={i < 4 ? 'currentColor' : 'none'}
            />
          ))}
          <span className="rating-text">(4.0)</span>
        </div>

        <div className="price-container">
          <span className="current-price">${formatPrice(price)}</span>
          {discountPercentage > 0 && (
            <span className="original-price">
              ${formatDiscount(price, discountPercentage)}
            </span>
          )}
        </div>

        <div className="product-actions">
          <motion.button
            className={`add-to-cart-btn ${loading ? 'loading' : ''}`}
            onClick={handleAddToCart}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingCart size={18} />
            {loading ? 'Adding...' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
