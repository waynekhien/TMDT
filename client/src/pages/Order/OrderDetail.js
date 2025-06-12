import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { getOrderById, cancelOrder } from '../../services/order.service';
import Notification from '../../components/Notification/Notification';
import './OrderDetail.css';

const OrderDetail = () => {
  const { showSuccess, showError, showConfirm } = useUI();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const { id } = useParams();
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const orderData = await getOrderById(id);
      setOrder(orderData);
    } catch (error) {
      showNotification('Lỗi khi tải chi tiết đơn hàng: ' + (error.error || error), 'error');
      setTimeout(() => navigate('/orders'), 2000);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!authState.status) {
      navigate('/login');
      return;
    }
    fetchOrderDetail();
  }, [id, authState.status, navigate, fetchOrderDetail]);
  const handleCancelOrder = async () => {
    const confirmed = await showConfirm({
      title: 'Xác nhận hủy đơn hàng',
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      type: 'warning'
    });

    if (!confirmed) {
      return;
    }

    try {
      await cancelOrder(id);
      showSuccess('Đơn hàng đã được hủy thành công');
      fetchOrderDetail(); // Refresh order data
    } catch (error) {
      showError('Lỗi khi hủy đơn hàng: ' + (error.error || error));
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

  const getPaymentStatusText = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending': return 'Chờ thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'failed': return 'Thanh toán thất bại';
      default: return paymentStatus;
    }
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="order-not-found">
          <h2>Không tìm thấy đơn hàng</h2>
          <button 
            className="back-btn"
            onClick={() => navigate('/orders')}
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="order-detail-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/orders')}
          >
            ← Quay lại
          </button>
          <div className="order-title">
            <h1>Chi tiết đơn hàng #{order.id}</h1>
            <p>Đặt hàng vào {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="header-right">
          <span 
            className="order-status-badge"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      <div className="order-detail-content">
        <div className="order-info-section">
          <div className="order-info-card">
            <h3>Thông tin đơn hàng</h3>
            <div className="info-row">
              <span className="label">Mã đơn hàng:</span>
              <span className="value">#{order.id}</span>
            </div>
            <div className="info-row">
              <span className="label">Trạng thái:</span>
              <span className="value">{getStatusText(order.status)}</span>
            </div>
            <div className="info-row">
              <span className="label">Thanh toán:</span>
              <span className="value">{getPaymentStatusText(order.paymentStatus)}</span>
            </div>
            <div className="info-row">
              <span className="label">Phương thức thanh toán:</span>
              <span className="value">{order.paymentMethod || 'Chưa xác định'}</span>
            </div>
          </div>

          <div className="shipping-info-card">
            <h3>Địa chỉ giao hàng</h3>
            <div className="shipping-address">
              {order.shippingAddress ? (
                <p>{order.shippingAddress}</p>
              ) : (
                <p className="no-address">Chưa có địa chỉ giao hàng</p>
              )}
            </div>
          </div>
        </div>

        <div className="order-items-section">
          <h3>Sản phẩm đã đặt</h3>
          <div className="order-items-list">
            {order.OrderItems && order.OrderItems.map(item => (
              <div key={item.id} className="order-item-detail">
                <div className="item-image">
                  <img 
                    src={item.Product?.thumbnail || '/images/placeholder.jpg'} 
                    alt={item.Product?.title}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="item-info">
                  <h4>{item.Product?.title}</h4>
                  <p className="item-description">{item.Product?.description}</p>
                  <div className="item-details-row">
                    <span className="quantity">Số lượng: {item.quantity}</span>
                    <span className="unit-price">Đơn giá: {formatPrice(item.price)}</span>
                    <span className="item-total">Thành tiền: {formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-summary-section">
          <div className="summary-card">
            <h3>Tổng kết đơn hàng</h3>
            <div className="summary-row">
              <span>Tổng tiền hàng:</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>Miễn phí</span>
            </div>
            <div className="summary-row total-row">
              <span>Tổng thanh toán:</span>
              <span className="total-amount">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {order.status === 'pending' && (
            <div className="order-actions-section">
              <button 
                className="cancel-order-btn"
                onClick={handleCancelOrder}
              >
                Hủy đơn hàng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
