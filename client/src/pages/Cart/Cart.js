import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import { createOrder } from '../../services/order.service';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Heart,
  Gift,
  Truck,
  Shield,
  CreditCard
} from 'lucide-react';
import { Loading, Card } from '../../components/UI';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();  const fetchCart = useCallback(async () => {
    try {
      if (!authState.status) {
        setCartItems([]);
        return;
      }
      
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.CART.GET}`, {
        headers: {
          accessToken: localStorage.getItem('accessToken')
        }
      });
      
      if (!response.data) {
        setCartItems([]);
        return;
      }
      
      const cartItems = response.data?.CartItems || [];
      setCartItems(cartItems);
    } catch (error) {
      setError(error.response?.data?.error || 'Error loading cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [authState.status]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      setUpdatingItems(prev => new Set([...prev, itemId]));
      await axios.put(`${API_BASE_URL}${API_ENDPOINTS.CART.UPDATE_ITEM}/${itemId}`,
        { quantity: newQuantity },
        {
          headers: {
            accessToken: localStorage.getItem('accessToken')
          }
        }
      );
      fetchCart();
    } catch (error) {
      setError('Lỗi khi cập nhật số lượng');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId) => {
    try {
      setRemovingItems(prev => new Set([...prev, itemId]));
      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.CART.REMOVE_ITEM}/${itemId}`, {
        headers: {
          accessToken: localStorage.getItem('accessToken')
        }
      });
      fetchCart();
    } catch (error) {
      setError('Lỗi khi xóa sản phẩm');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const proceedToCheckout = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Please login to place order');
      navigate('/login');
      return;
    }

    const totalAmount = cartItems.reduce((sum, item) =>
      sum + (Number(item.Product.price || 0) * Number(item.quantity || 0)), 0
    );

    // Navigate to checkout page with cart data
    navigate('/checkout', {
      state: {
        cartItems,
        totalAmount
      }
    });
  };
  if (loading) {
    return (
      <div className="modern-cart-page">
        <Loading size="lg" text="Đang tải giỏ hàng..." fullScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-cart-page">
        <div className="error-container">
          <div className="error-content">
            <ShoppingCart size={48} className="error-icon" />
            <h2>Có lỗi xảy ra</h2>
            <p>{error}</p>
            <button
              className="retry-button"
              onClick={() => {
                setError(null);
                fetchCart();
              }}
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) =>
    sum + (Number(item.Product.price || 0) * Number(item.quantity || 0)), 0
  );

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="modern-cart-page">
      {/* Header */}
      <motion.div
        className="cart-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <button
            className="back-button"
            onClick={() => navigate('/products')}
          >
            <ArrowLeft size={20} />
            <span>Tiếp tục mua sắm</span>
          </button>

          <div className="header-title">
            <h1>Giỏ hàng của bạn</h1>
            <p>{itemCount} sản phẩm</p>
          </div>
        </div>
      </motion.div>

      {cartItems.length === 0 ? (        <motion.div
          className="cart-empty"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="empty-content">
            <div className="empty-icon">
              <ShoppingCart size={80} />
            </div>
            <h2>Giỏ hàng trống</h2>
            <p>Hãy thêm một số sản phẩm vào giỏ hàng để bắt đầu mua sắm</p>
            <div className="empty-actions">
              <button
                className="continue-shopping-btn"
                onClick={() => navigate('/products')}
              >
                <ShoppingBag size={20} />
                Tiếp tục mua sắm
              </button>
              <button
                className="wishlist-btn"
                onClick={() => navigate('/wishlist')}
              >
                <Heart size={20} />
                Xem danh sách yêu thích
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="cart-content">
          {/* Cart Items */}
          <motion.div
            className="cart-items-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="section-header">
              <h2>Sản phẩm trong giỏ</h2>
              <span className="item-count">{itemCount} sản phẩm</span>
            </div>

            <div className="cart-items">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="cart-item-modern"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    layout
                  >
                    <Card className="cart-item-card" padding="lg">
                      <div className="cart-item-content">
                        <div className="item-image">
                          <img
                            src={item.Product.thumbnail}
                            alt={item.Product.title}
                          />
                        </div>

                        <div className="item-details">
                          <div className="item-info">
                            <h3 className="item-title">{item.Product.title}</h3>
                            <p className="item-brand">{item.Product.brand}</p>
                            <div className="item-price">
                              <span className="current-price">
                                ${Number(item.Product.price || 0).toFixed(2)}
                              </span>
                              <span className="price-label">USD</span>
                            </div>
                          </div>

                          <div className="item-actions">
                            <div className="quantity-section">
                              <label>Số lượng:</label>
                              <div className="quantity-controls">
                                <motion.button
                                  className="quantity-btn"
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Minus size={16} />
                                </motion.button>

                                <span className="quantity-display">
                                  {updatingItems.has(item.id) ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    item.quantity
                                  )}
                                </span>

                                <motion.button
                                  className="quantity-btn"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={updatingItems.has(item.id)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Plus size={16} />
                                </motion.button>
                              </div>
                            </div>

                            <div className="item-total">
                              <span className="total-label">Tổng:</span>
                              <span className="total-price">
                                ${(Number(item.Product.price || 0) * item.quantity).toFixed(2)}
                              </span>
                            </div>

                            <motion.button
                              className="remove-button"
                              onClick={() => removeItem(item.id)}
                              disabled={removingItems.has(item.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {removingItems.has(item.id) ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                              <span>Xóa</span>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>          {/* Cart Summary */}
          <motion.div
            className="cart-summary-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="summary-card" padding="lg">
              <div className="summary-header">
                <h2>Tóm tắt đơn hàng</h2>
              </div>

              <div className="summary-details">
                <div className="summary-row">
                  <span>Tạm tính ({itemCount} sản phẩm):</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span className="free-shipping">Miễn phí</span>
                </div>
                <div className="summary-row">
                  <span>Giảm giá:</span>
                  <span>-$0.00</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span>Tổng cộng:</span>
                  <span className="total-amount">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="benefits-section">
                <h3>Quyền lợi của bạn</h3>
                <div className="benefits-list">
                  <div className="benefit-item">
                    <Truck size={16} />
                    <span>Miễn phí vận chuyển</span>
                  </div>
                  <div className="benefit-item">
                    <Shield size={16} />
                    <span>Bảo hành chính hãng</span>
                  </div>
                  <div className="benefit-item">
                    <Gift size={16} />
                    <span>Tích điểm thưởng</span>
                  </div>
                </div>
              </div>

              <div className="checkout-section">
                <motion.button
                  className="checkout-button"
                  onClick={proceedToCheckout}
                  disabled={operationLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {operationLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <CreditCard size={20} />
                  )}
                  <span>Tiến hành thanh toán</span>
                </motion.button>

                <p className="checkout-note">
                  <Shield size={14} />
                  Thanh toán an toàn và bảo mật
                </p>

                <div className="payment-methods">
                  <span>Chấp nhận:</span>
                  <div className="payment-icons">
                    <div className="payment-icon">VISA</div>
                    <div className="payment-icon">MC</div>
                    <div className="payment-icon">MOMO</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cart;