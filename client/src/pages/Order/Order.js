import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { getUserOrders, cancelOrder, deleteOrder } from '../../services/order.service';
import Notification from '../../components/Notification/Notification';
import { Package, ShoppingBag, Eye, X, Trash2, Loader2 } from 'lucide-react';
import './Order.css';

const Order = () => {
  const { showSuccess, showError, showConfirm } = useUI();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const ordersData = await getUserOrders();
      setOrders(ordersData);
    } catch (error) {
      showNotification('Lỗi khi tải đơn hàng: ' + (error.error || error), 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authState.status) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [authState.status, navigate, fetchOrders]);  const handleCancelOrder = async (orderId) => {
    const confirmed = await showConfirm({
      title: 'Xác nhận hủy đơn hàng',
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      type: 'warning'
    });

    if (!confirmed) {
      return;
    }

    try {
      await cancelOrder(orderId);
      showSuccess('Đơn hàng đã được hủy thành công');
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      showError('Lỗi khi hủy đơn hàng: ' + (error.error || error));
    }
  };
  const handleDeleteOrder = async (orderId) => {
    const confirmed = await showConfirm({
      title: 'Xác nhận xóa đơn hàng',
      message: 'Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteOrder(orderId);
      showSuccess('Đơn hàng đã được xóa thành công');
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      showError('Lỗi khi xóa đơn hàng: ' + (error.error || error));
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  const formatPrice = (price) => {
    try {
      return `$${Number(price || 0).toFixed(2)} USD`;
    } catch (error) {
      return '$0.00 USD';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#007bff';
      case 'shipped': return '#17a2b8';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {    return (
      <div className="order-page">
        <div className="loading">
          <Loader2 size={32} className="animate-spin" />
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="order-header">
        <h1>Đơn hàng của tôi</h1>
        <p>Quản lý và theo dõi đơn hàng của bạn</p>
      </div>      {orders.length === 0 ? (
        <div className="empty-orders">
          <Package size={64} color="#ccc" />
          <h3>Chưa có đơn hàng nào</h3>
          <p>Bạn chưa có đơn hàng nào. Hãy khám phá sản phẩm và đặt hàng ngay!</p>
          <button 
            className="browse-products-btn"
            onClick={() => navigate('/products')}
          >
            <ShoppingBag size={16} />
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header-info">
                <div className="order-id">
                  <strong>Đơn hàng #{order.id}</strong>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.OrderItems && order.OrderItems.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="item-image">
                      <img 
                        src={item.Product?.thumbnail || '/images/placeholder.jpg'} 
                        alt={item.Product?.title}
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h4>{item.Product?.title}</h4>
                      <p className="item-quantity">Số lượng: {item.quantity}</p>
                      <p className="item-price">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <strong>Tổng cộng: {formatPrice(order.totalAmount)}</strong>
                </div>                <div className="order-actions">
                  <button 
                    className="view-details-btn"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <Eye size={16} />
                    Xem chi tiết
                  </button>
                  {order.status === 'pending' && (
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      <X size={16} />
                      Hủy đơn hàng
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'cancelled') && (
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteOrder(order.id)}
                    >
                      <Trash2 size={16} />
                      Xóa đơn hàng
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;