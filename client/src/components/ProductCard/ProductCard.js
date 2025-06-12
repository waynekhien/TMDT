import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="product-card">
      <div className="product-image">
        <img src={thumbnail} alt={title} />
        {discountPercentage > 0 && (
          <span className="discount-badge">-{discountPercentage.toFixed(0)}%</span>
        )}
      </div>
      <div className="product-info">
        <h3>{title}</h3>
        <p className="brand">{brand}</p>        <div className="price-container">
          <span className="price">${formatPrice(price)}</span>
          {discountPercentage > 0 && (
            <span className="original-price">
              ${formatDiscount(price, discountPercentage)}
            </span>
          )}
        </div>        <div className="product-actions">
          <button 
            className={`add-to-cart ${loading ? 'loading' : ''}`} 
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add to Cart'}
          </button>
          <Link to={`/products/${id}`} className="view-details">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
