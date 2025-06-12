import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/admin.service';
import { useUI } from '../../../context/UIContext';
import { 
  ADMIN_CONSTANTS, 
  ORDER_STATUS_OPTIONS, 
  ORDER_STATUS_COLORS,
  formatCurrency,
  formatDate,
  getStatusLabel,
  calculateOrderTotal
} from '../../../constants/admin';
import {
  Download,
  Filter,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Search
} from 'lucide-react';
import './OrderManagement.css';

const OrderManagement = () => {
  const { showSuccess, showError } = useUI();
  const { page } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(parseInt(page) || ADMIN_CONSTANTS.PAGINATION.DEFAULT_PAGE);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [showOrderDetails, setShowOrderDetails] = useState(null);const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminService.getOrders(
        currentPage,
        ADMIN_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
        statusFilter,
        dateFilter.startDate,
        dateFilter.endDate,
        searchTerm
      );
      
      setOrders(response.orders || response);
      setTotalPages(response.totalPages || Math.ceil((response.length || 0) / ADMIN_CONSTANTS.PAGINATION.DEFAULT_LIMIT));    } catch (err) {
      setError(err.error || err.message || 'Error loading order list');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, dateFilter.startDate, dateFilter.endDate, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update URL when page changes
  useEffect(() => {
    if (page && parseInt(page) !== currentPage) {
      setCurrentPage(parseInt(page));
    }
  }, [page]);

  // Navigate to new URL when page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    navigate(`/admin/orders/page/${newPage}`);
  };  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Set loading state for this specific order if needed
      const orderIndex = orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        const updatedOrders = [...orders];
        updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], isUpdating: true };
        setOrders(updatedOrders);
      }      // Call API to update status
      await adminService.updateOrderStatus(orderId, newStatus);
      
      // Update orders in state with the new status
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, isUpdating: false }
          : order
      ));        // Show success notification
      showSuccess('Order status updated successfully!');    } catch (err) {
      showError(err.message || 'Error updating order status');
      
      // Reset updating state on error
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, isUpdating: false }
          : order
      ));
    }
  };

  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyDateFilter = () => {
    setCurrentPage(1);
    navigate('/admin/orders/page/1');
    fetchOrders();
  };
  const handleSearch = () => {
    setCurrentPage(1);
    navigate('/admin/orders/page/1');
    fetchOrders();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter({ startDate: '', endDate: '' });
    setCurrentPage(ADMIN_CONSTANTS.PAGINATION.DEFAULT_PAGE);
    navigate('/admin/orders/page/1');
    setTimeout(() => fetchOrders(), 100);
  };

  const handleExportOrders = async () => {
    try {
      await adminService.exportOrders(
        dateFilter.startDate,
        dateFilter.endDate,
        statusFilter
      );    } catch (err) {
      showError('Error exporting order data');
    }
  };
  if (loading && orders.length === 0) {
    return <div className="order-management-loading">Loading orders...</div>;
  }

  return (
    <div className="order-management">
      {/* Header */}      <div className="order-management-header">
        <h1>Order Management</h1>        <button 
          className="export-orders-btn"
          onClick={handleExportOrders}
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Search and Filters */}
      <div className="order-filters">
        <div className="search-section">
          <div className="search-group">
            <input
              type="text"
              placeholder="Tìm kiếm theo ID đơn hàng, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-btn">
              <Search size={16} />
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            {ORDER_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>        <div className="filter-group">
          <label>From Date:</label>
          <input
            type="date"
            value={dateFilter.startDate}
            onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
            className="date-filter"
          />
        </div>

        <div className="filter-group">
          <label>To Date:</label>
          <input
            type="date"
            value={dateFilter.endDate}
            onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
            className="date-filter"
          />
        </div>        <div className="filter-actions">
          <button onClick={applyDateFilter} className="apply-filter-btn">
            <Filter size={16} />
            Apply Filter
          </button>
          <button onClick={clearFilters} className="clear-filter-btn">
            <RotateCcw size={16} />
            Clear Filters
          </button>
        </div>
      </div>      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchOrders} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Orders Table */}
      <div className="orders-table-container">        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Order Date</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">#{order.id}</td>
                <td className="customer-info">
                  <div>
                    <div className="customer-name">
                      {order.User?.username || 'N/A'}
                    </div>
                    <div className="customer-email">
                      {order.User?.email || 'N/A'}
                    </div>
                  </div>
                </td>                <td className="order-date">
                  {formatDate(order.createdAt)}
                </td>
                <td className="order-total">
                  {formatCurrency(order.totalAmount || calculateOrderTotal(order.OrderItems))}
                </td>
                <td className="order-status">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="status-select"
                    style={{ 
                      backgroundColor: ORDER_STATUS_COLORS[order.status],
                      color: 'white'
                    }}
                  >
                    {ORDER_STATUS_OPTIONS.slice(1).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>                <td className="order-actions">                  <button 
                    onClick={() => setShowOrderDetails(order)}
                    className="view-details-btn"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  {order.isUpdating && (
                    <span className="status-updating-indicator">
                      <Loader2 size={16} className="animate-spin" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>        {orders.length === 0 && !loading && (
          <div className="no-orders">
            No orders found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="pagination-info">
            Page {currentPage} / {totalPages}
          </span>
            <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div className="modal-overlay">
          <div className="order-details-modal">            <div className="modal-header">
              <h2>Order Details #{showOrderDetails.id}</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setShowOrderDetails(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="order-details-content">
              {/* Customer Information */}
              <div className="details-section">
                <h3>Customer Information</h3>
                <div className="customer-details">
                  <p><strong>Name:</strong> {showOrderDetails.User?.username || 'N/A'}</p>
                  <p><strong>Email:</strong> {showOrderDetails.User?.email || 'N/A'}</p>
                </div>
              </div>              {/* Order Information */}
              <div className="details-section">
                <h3>Order Information</h3>
                <div className="order-info">
                  <p><strong>Order Date:</strong> {formatDate(showOrderDetails.createdAt)}</p>
                  <p><strong>Status:</strong> 
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: ORDER_STATUS_COLORS[showOrderDetails.status] }}
                    >
                      {getStatusLabel(showOrderDetails.status)}
                    </span>
                  </p>
                  <p><strong>Shipping Address:</strong> {showOrderDetails.shippingAddress || 'N/A'}</p>
                  <p><strong>Payment Method:</strong> {showOrderDetails.paymentMethod || 'N/A'}</p>
                </div>
              </div>              {/* Order Items */}
              <div className="details-section">
                <h3>Products</h3>
                <div className="order-items">
                  {showOrderDetails.OrderItems && showOrderDetails.OrderItems.length > 0 ? (
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {showOrderDetails.OrderItems.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div className="item-info">
                                <img 
                                  src={item.Product?.thumbnail || '/placeholder-image.png'} 
                                  alt={item.Product?.title || 'Product'}
                                  className="item-thumbnail"
                                />
                                <span>{item.Product?.title || 'N/A'}</span>
                              </div>
                            </td>                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.price)}</td>
                            <td>{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No product information available</p>
                  )}
                </div>
              </div>

              {/* Order Total */}
              <div className="details-section">
                <div className="order-total-section">
                  <h3>Total: {formatCurrency(showOrderDetails.totalAmount || calculateOrderTotal(showOrderDetails.OrderItems))}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
