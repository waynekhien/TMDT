import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Notification from '../../components/Notification/Notification';
import CommentSection from '../../components/CommentSection/CommentSection';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import { getProductById } from '../../services/product.service';
import { Minus, Plus, ShoppingCart, Star, Package } from 'lucide-react';
import axios from 'axios';
import './ProductDetail.css';

/**
 * ProductDetail Component
 * 
 * Displays detailed information about a product and allows users to add it to their cart.
 * Uses the product service to fetch data from the API.
 */

const ProductDetail = () => {  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const { authState } = useContext(AuthContext);  const addToCart = async () => {
    if (!authState.status) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CART.ADD_ITEM}`, {
        productId: product.id,
        quantity: quantity
      }, {
        headers: {
          accessToken: localStorage.getItem('accessToken')
        }
      });

      setNotification({
        message: 'Đã thêm sản phẩm vào giỏ hàng',
        type: 'success'
      });

      // Reset quantity after adding to cart
      setQuantity(1);
    } catch (error) {
      setNotification({
        message: 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.',
        type: 'error'
      });
    } finally {
      setAddingToCart(false);
    }
  };  const fetchProductDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(err.message || 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [id]); // Add id as dependency
  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]); // Use memoized function as dependency
  
  const formatPrice = (price) => {
    try {
      return `$${Number(price || 0).toFixed(2)} USD`;
    } catch (error) {
      return '$0.00 USD';
    }
  };
  
  if (loading) {
    return <div className="product-detail-loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="product-detail-error">Lỗi: {error}</div>;
  }

  if (!product) {
    return <div className="product-detail-error">Không tìm thấy sản phẩm</div>;
  }

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <div className="product-images">
          <img 
            src={product.thumbnail} 
            alt={product.title} 
            className="main-image" 
          />
          <div className="additional-images">
            {product.images && product.images.map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`${product.title} - ${index + 1}`} 
                className="thumbnail-image"
              />
            ))}
          </div>
        </div>

        <div className="product-info">
          <h1>{product.title}</h1>          <p className="brand">Thương hiệu: {product.brand}</p>
          <p className="category">Danh mục: {product.category}</p>
            <div className="price-section">            <div className="current-price">
              {formatPrice(product.price)}
            </div>
            {product.discountPercentage > 0 && (
              <div className="discount-info">
                <span className="original-price">
                  {formatPrice(product.price * (100 + product.discountPercentage) / 100)}
                </span>
                <span className="discount-percentage">
                  -{product.discountPercentage.toFixed(0)}% GIẢM
                </span>
              </div>
            )}
          </div>          <div className="stock-info">
            <Package size={16} />
            <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
            </span>
            {product.stock > 0 && <span className="stock-count">(Còn {product.stock} sản phẩm)</span>}
          </div>

          <p className="description">{product.description}</p>          <div className="rating">
            <Star size={16} />
            Rating: {product.rating} / 5
          </div><div className="actions">            <div className="quantity-controls">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || addingToCart}
              >
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock || addingToCart}
              >
                <Plus size={16} />
              </button>
            </div>
            <button 
              className="add-to-cart-btn" 
              onClick={addToCart}
              disabled={product.stock === 0 || addingToCart}
            >
              <ShoppingCart size={18} />
              {addingToCart ? 'Đang thêm...' : 
               product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </button>
          </div>
          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
        </div>
      </div>

      {/* Comment Section */}
      <CommentSection productId={product.id} />
    </div>
  );
};

export default ProductDetail;
