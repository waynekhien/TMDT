import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import { createOrder } from '../../services/order.service';
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag, Loader2, CheckCircle } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError('Error updating quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.CART.REMOVE_ITEM}/${itemId}`, {
        headers: {
          accessToken: localStorage.getItem('accessToken')
        }
      });
      fetchCart();
    } catch (error) {
      setError('Error removing item');
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
    if (loading) return <div className="cart-loading">Đang tải...</div>;
    if (error) return <div className="cart-error">{error}</div>;

    const total = cartItems.reduce((sum, item) =>
        sum + (Number(item.Product.price || 0) * Number(item.quantity || 0)), 0
    );

    return (
        <div className="cart-container">
            <h2>Giỏ hàng của bạn</h2>
            {cartItems.length === 0 ? (                <div className="cart-empty">
                    <ShoppingCart size={64} color="#ccc" />
                    <p>Giỏ hàng trống</p>
                    <button onClick={() => navigate('/products')}>
                        <ShoppingBag size={16} />
                        Tiếp tục mua sắm
                    </button>
                </div>
            ) : (
                <>                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-image">
                                    <img 
                                        src={item.Product.thumbnail} 
                                        alt={item.Product.title}
                                    />
                                </div>
                                <div className="cart-item-details">
                                    <h3>{item.Product.title}</h3>                                    <p className="price">
                                        ${Number(item.Product.price || 0).toFixed(2)} USD
                                    </p><div className="quantity-controls">
                                        <button 
                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <button 
                                        className="remove-button"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        <Trash2 size={16} />
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>                    <div className="cart-summary">
                        <div className="subtotal">
                            <span>Tổng tiền:</span>
                            <span className="total-amount">
                                ${Number(total || 0).toFixed(2)} USD
                            </span>
                        </div>                        <div className="checkout-options">
                            <button
                                className="checkout-button"
                                onClick={proceedToCheckout}
                                disabled={operationLoading}
                            >
                                <CheckCircle size={16} />
                                Tiến hành thanh toán
                            </button>
                            <p className="checkout-note">
                                * Bạn sẽ có thể chọn phương thức thanh toán và nhập địa chỉ giao hàng ở trang tiếp theo
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;