import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { createOrder } from '../../services/order.service';
import { createSolanaPayment, checkPaymentStatus, verifyPaymentWithBackend } from '../../services/solana.service';
import { API_BASE_URL } from '../../constants/api';
import axios from 'axios';
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  Wallet,
  CheckCircle,
  Loader2,
  ArrowLeft,
  QrCode,
  RefreshCw,
  X
} from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useContext(AuthContext);
  
  // Get cart data from navigation state
  const { cartItems, totalAmount } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Solana payment states
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, confirmed, failed
  const [paymentCheckInterval, setPaymentCheckInterval] = useState(null);

  useEffect(() => {
    // Redirect if no cart data
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
      return;
    }
  }, [cartItems, navigate]);

  useEffect(() => {
    // Cleanup payment check interval on unmount
    return () => {
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
      }
    };
  }, [paymentCheckInterval]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentData(null);
    setPaymentStatus('pending');

    // Clear any existing payment check interval
    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval);
      setPaymentCheckInterval(null);
    }
  };

  const cancelSolanaPayment = () => {
    // Clear payment data and interval
    setPaymentData(null);
    setPaymentStatus('pending');

    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval);
      setPaymentCheckInterval(null);
    }
  };

  const generateSolanaQR = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Generating Solana QR for total amount:', totalAmount);

      // Create temporary order ID for reference
      const tempOrderId = `temp-${Date.now()}`;
      console.log('Temp order ID:', tempOrderId);

      const payment = await createSolanaPayment(totalAmount, tempOrderId);
      console.log('Payment data received:', payment);

      setPaymentData(payment);
      setPaymentStatus('processing');

      // Start checking payment status
      const interval = setInterval(async () => {
        try {
          console.log('Checking payment status...');
          const status = await checkPaymentStatus(payment.reference, payment.solAmount);
          console.log('Payment status:', status);

          if (status.confirmed) {
            setPaymentStatus('confirmed');
            clearInterval(interval);
            setPaymentCheckInterval(null);

            // Process the order
            await processOrder(status.signature, payment.reference);
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 5000); // Check every 5 seconds

      setPaymentCheckInterval(interval);
    } catch (error) {
      console.error('Error in generateSolanaQR:', error);
      setError('Failed to generate payment QR code: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const processOrder = async (signature = null, reference = null) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Processing order with data:', {
        cartItems,
        totalAmount,
        shippingAddress,
        paymentMethod,
        signature,
        reference
      });

      const orderItems = cartItems.map(item => ({
        productId: item.Product.id,
        quantity: Number(item.quantity || 0),
        price: Number(item.Product.price || 0)
      }));

      const orderData = {
        items: orderItems,
        shippingAddress: shippingAddress || 'To be updated',
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        solanaSignature: signature,
        solanaReference: reference
      };

      console.log('Order data to send:', orderData);

      const result = await createOrder(orderData);
      console.log('Order creation result:', result);

      // If Solana payment, verify with backend
      if (signature && reference) {
        console.log('Verifying Solana payment...');
        await verifyPaymentWithBackend(result.orderId, signature, reference);
        console.log('Solana payment verified');
      }

      // Clear cart after successful order
      console.log('Clearing cart...');
      await axios.delete(`${API_BASE_URL}/api/cart`, {
        headers: {
          accessToken: localStorage.getItem('accessToken')
        }
      });
      console.log('Cart cleared');

      setSuccess(true);

      // Redirect to orders page immediately for better UX
      setTimeout(() => {
        navigate('/orders');
      }, 1500);

    } catch (error) {
      console.error('Order processing error:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.error || error.error || error.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'SOLANA') {
      if (!paymentData) {
        await generateSolanaQR();
      } else if (paymentStatus === 'confirmed') {
        // Payment already confirmed, process order
        await processOrder();
      }
    } else {
      // COD payment
      await processOrder();
    }
  };

  if (!cartItems) {
    return <div className="checkout-loading">Loading...</div>;
  }

  if (success) {
    return (
      <div className="checkout-success">
        <CheckCircle size={64} color="#10b981" />
        <h2>Đặt hàng thành công!</h2>
        <p>Đơn hàng của bạn đã được xử lý thành công.</p>
        <p>Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button 
          className="back-button"
          onClick={() => navigate('/cart')}
          disabled={loading}
        >
          <ArrowLeft size={20} />
          Quay lại giỏ hàng
        </button>
        <h1>Thanh toán</h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-form">
          <form onSubmit={handleSubmit}>
            {/* Order Summary */}
            <div className="checkout-section">
              <h3><ShoppingCart size={20} /> Đơn hàng của bạn</h3>
              <div className="order-items">
                {cartItems.map(item => (
                  <div key={item.id} className="order-item">
                    <img src={item.Product.thumbnail} alt={item.Product.title} />
                    <div className="item-details">
                      <h4>{item.Product.title}</h4>
                      <p>Số lượng: {item.quantity}</p>
                      <p className="item-price">
                        ${(Number(item.Product.price || 0) * Number(item.quantity || 0)).toFixed(2)} USD
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <strong>Tổng cộng: ${Number(totalAmount || 0).toFixed(2)} USD</strong>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="checkout-section">
              <h3><MapPin size={20} /> Địa chỉ giao hàng</h3>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Nhập địa chỉ giao hàng của bạn..."
                rows={3}
                required={paymentMethod === 'COD'}
              />
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h3><CreditCard size={20} /> Phương thức thanh toán</h3>
              <div className="payment-methods">
                <label className="payment-method">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="payment-method">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="SOLANA"
                    checked={paymentMethod === 'SOLANA'}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  />
                  <span><Wallet size={16} /> Thanh toán bằng Solana</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="checkout-error">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="checkout-submit"
              disabled={loading || (paymentMethod === 'SOLANA' && paymentStatus === 'processing')}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : paymentMethod === 'SOLANA' && !paymentData ? (
                <>
                  <QrCode size={16} />
                  Tạo mã QR thanh toán
                </>
              ) : paymentMethod === 'SOLANA' && paymentStatus === 'processing' ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Đang chờ thanh toán...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Xác nhận đặt hàng
                </>
              )}
            </button>
          </form>
        </div>

        {/* Solana QR Code Display */}
        {paymentMethod === 'SOLANA' && paymentData && (
          <div className="solana-payment">
            <div className="qr-section">
              <h3>Quét mã QR để thanh toán</h3>
              <div className="qr-code">
                <img src={paymentData.qrCode} alt="Solana Payment QR Code" />
              </div>
              <div className="payment-details">
                <p><strong>Số tiền:</strong> {paymentData.solAmount.toFixed(4)} SOL</p>
                <p><strong>Địa chỉ nhận:</strong> {paymentData.recipient}</p>
                <p className="payment-status">
                  Trạng thái: 
                  <span className={`status ${paymentStatus}`}>
                    {paymentStatus === 'processing' && ' Đang chờ thanh toán...'}
                    {paymentStatus === 'confirmed' && ' Đã xác nhận'}
                    {paymentStatus === 'failed' && ' Thất bại'}
                  </span>
                </p>
              </div>
              <p className="qr-instructions">
                Sử dụng ví Phantom hoặc ví Solana khác để quét mã QR và thực hiện thanh toán.
              </p>
              <button
                className="cancel-payment-button"
                onClick={cancelSolanaPayment}
                disabled={loading}
              >
                <X size={16} />
                Hủy thanh toán
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
