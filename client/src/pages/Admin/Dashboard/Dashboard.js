import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../services/admin.service';
import { useUI } from '../../../context/UIContext';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  BarChart3,
  RefreshCw,
  Eye,
  Calendar,
  Clock,
  AlertTriangle,
  Activity,
  Bell,
  Filter,
  Settings
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { showSuccess, showError } = useUI();
  const [overview, setOverview] = useState({});
  const [orderStats, setOrderStats] = useState({});
  const [productStats, setProductStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        overviewData,
        orderData,
        productData,
        userData
      ] = await Promise.all([
        adminService.getDashboardOverview(),
        adminService.getOrderStats(selectedPeriod),
        adminService.getProductStats(),
        adminService.getUserStats()
      ]);

      setOverview(overviewData);
      setOrderStats(orderData);
      setProductStats(productData);
      setUserStats(userData);
      setLastUpdated(new Date());

      // Generate recent activities from real data
      const activities = [];

      // Add recent orders
      if (overviewData.recentOrders) {
        overviewData.recentOrders.slice(0, 3).forEach(order => {
          activities.push({
            id: `order-${order.id}`,
            type: 'order',
            message: `Đơn hàng #${order.id} đã được tạo bởi ${order.User?.username || 'Khách hàng'}`,
            time: new Date(order.createdAt || order.created_at),
            data: order
          });
        });
      }

      // Add new users
      if (userData.recentUsers) {
        userData.recentUsers.slice(0, 2).forEach(user => {
          activities.push({
            id: `user-${user.id}`,
            type: 'user',
            message: `Người dùng mới đăng ký: ${user.username}`,
            time: new Date(user.createdAt || user.created_at),
            data: user
          });
        });
      }

      // Add low stock alerts
      if (productData.lowStockProducts) {
        productData.lowStockProducts.slice(0, 2).forEach(product => {
          activities.push({
            id: `product-${product.id}`,
            type: 'product',
            message: `Sản phẩm "${product.title}" sắp hết hàng (còn ${product.stock})`,
            time: new Date(Date.now() - Math.random() * 60 * 60 * 1000), // Random time within last hour
            data: product
          });
        });
      }

      // Sort by time and take latest 6
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivities(activities.slice(0, 6));

      // Generate alerts based on real data
      const newAlerts = [];

      // Low stock alert
      if (productData.lowStockProducts && productData.lowStockProducts.length > 0) {
        newAlerts.push({
          id: 'low-stock',
          type: 'warning',
          message: `${productData.lowStockProducts.length} sản phẩm sắp hết hàng`,
          priority: 'high',
          action: () => window.location.href = '/admin/products/page/1?filter=low-stock'
        });
      }

      // Pending orders alert
      if (overviewData.pendingOrders > 10) {
        newAlerts.push({
          id: 'pending-orders',
          type: 'info',
          message: `${overviewData.pendingOrders} đơn hàng đang chờ xử lý`,
          priority: 'medium',
          action: () => window.location.href = '/admin/orders/page/1?status=pending'
        });
      }

      // Revenue growth alert
      if (overviewData.revenueGrowth < -10) {
        newAlerts.push({
          id: 'revenue-decline',
          type: 'warning',
          message: `Doanh thu giảm ${Math.abs(overviewData.revenueGrowth)}% so với tháng trước`,
          priority: 'high',
          action: () => window.location.href = '/admin/analytics'
        });
      } else if (overviewData.revenueGrowth > 20) {
        newAlerts.push({
          id: 'revenue-growth',
          type: 'success',
          message: `Doanh thu tăng ${overviewData.revenueGrowth}% so với tháng trước!`,
          priority: 'low'
        });
      }

      // New users alert
      if (userData.newUsers > 50) {
        newAlerts.push({
          id: 'new-users',
          type: 'success',
          message: `${userData.newUsers} người dùng mới trong ${selectedPeriod === 'week' ? '7 ngày' : '30 ngày'} qua`,
          priority: 'low'
        });
      }

      setAlerts(newAlerts);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod, fetchDashboardData]);

  // Auto refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, fetchDashboardData]);

  const handleExportOrders = async () => {    try {
      setLoading(true);
      await adminService.exportOrders();
      showSuccess('Xuất báo cáo đơn hàng thành công!');
    } catch (err) {
      showError('Có lỗi xảy ra khi xuất dữ liệu đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatLastUpdated = () => {
    return lastUpdated.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) {
      return `${minutes} phút trước`;
    } else if (hours < 24) {
      return `${hours} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };



  const getActivityIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingCart size={16} />;
      case 'user': return <Users size={16} />;
      case 'product': return <Package size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={16} />;
      case 'info': return <Bell size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertTriangle size={48} />
        <h2>Có lỗi xảy ra</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-button">
          <RefreshCw size={16} />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header with controls */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Dashboard</h1>
            <div className="last-updated">
              <Clock size={14} />
              <span>Cập nhật lần cuối: {formatLastUpdated()}</span>
            </div>
          </div>
          <div className="header-controls">
            <div className="auto-refresh-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Tự động làm mới
              </label>
            </div>
            <div className="period-selector">
              <label>Thống kê theo:</label>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="period-select"
              >
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="year">12 tháng qua</option>
              </select>
            </div>
            <button 
              className="refresh-btn"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h2>Thông báo quan trọng</h2>
          <div className="alerts-grid">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`alert-card ${alert.type} ${alert.priority} ${alert.action ? 'clickable' : ''}`}
                onClick={alert.action}
              >
                <div className="alert-icon">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="alert-content">
                  <p>{alert.message}</p>
                  {alert.action && (
                    <span className="alert-action-hint">Nhấn để xem chi tiết</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <h3>Tổng người dùng</h3>
            <p className="stat-number">{overview.totalUsers || 0}</p>
            <span className="stat-change positive">
              <TrendingUp size={14} />
              +{userStats.newUsers || 0} người dùng mới ({selectedPeriod === 'week' ? '7 ngày' : '30 ngày'})
            </span>
          </div>
          <div className="stat-chart">
            <div className="mini-chart users-chart"></div>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon">
            <Package size={28} />
          </div>
          <div className="stat-content">
            <h3>Tổng sản phẩm</h3>
            <p className="stat-number">{overview.totalProducts || 0}</p>
            <span className={`stat-change ${productStats.lowStockProducts?.length > 0 ? 'warning' : 'neutral'}`}>
              <AlertTriangle size={14} />
              {productStats.lowStockProducts?.length || 0} sản phẩm sắp hết hàng
            </span>
          </div>
          <div className="stat-chart">
            <div className="mini-chart products-chart"></div>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">
            <ShoppingCart size={28} />
          </div>
          <div className="stat-content">
            <h3>Tổng đơn hàng</h3>
            <p className="stat-number">{overview.totalOrders || 0}</p>
            <span className="stat-change info">
              <Clock size={14} />
              {overview.pendingOrders || 0} đơn chờ xử lý
            </span>
          </div>
          <div className="stat-chart">
            <div className="mini-chart orders-chart"></div>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">
            <DollarSign size={28} />
          </div>
          <div className="stat-content">
            <h3>Doanh thu tháng này</h3>
            <p className="stat-number">
              {adminService.formatCurrency(overview.thisMonthRevenue || 0)}
            </p>
            <span className={`stat-change ${overview.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
              {overview.revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {overview.revenueGrowth >= 0 ? '+' : ''}{overview.revenueGrowth || 0}% so với tháng trước
            </span>
          </div>
          <div className="stat-chart">
            <div className="mini-chart revenue-chart"></div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Revenue Chart */}
          <div className="chart-section">
            <div className="section-header">
              <h2>Biểu đồ doanh thu</h2>
              <div className="chart-controls">
                <button className="chart-btn active">Doanh thu</button>
                <button className="chart-btn">Đơn hàng</button>
                <button className="chart-btn">Lượt xem</button>
              </div>
            </div>
            <div className="chart-container">
              <div className="revenue-chart-placeholder">
                <div className="chart-bars">
                  <div className="bar" style={{height: '60%'}}></div>
                  <div className="bar" style={{height: '80%'}}></div>
                  <div className="bar" style={{height: '45%'}}></div>
                  <div className="bar" style={{height: '90%'}}></div>
                  <div className="bar" style={{height: '70%'}}></div>
                  <div className="bar" style={{height: '55%'}}></div>
                  <div className="bar" style={{height: '85%'}}></div>
                </div>
                <div className="chart-labels">
                  <span>T2</span>
                  <span>T3</span>
                  <span>T4</span>
                  <span>T5</span>
                  <span>T6</span>
                  <span>T7</span>
                  <span>CN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="top-products-section">
            <div className="section-header">
              <h2>Sản phẩm bán chạy</h2>
              <button className="view-all-btn">
                <Eye size={16} />
                Xem tất cả
              </button>
            </div>
            <div className="top-products-table">
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đã bán</th>
                    <th>Doanh thu</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.topProducts && overview.topProducts.length > 0 ? (
                    overview.topProducts.map((product, index) => (
                      <tr key={index}>
                        <td>
                          <div className="product-info">
                            <img 
                              src={product.Product?.thumbnail || '/placeholder-image.png'} 
                              alt={product.Product?.title || 'Product'}
                              className="product-thumbnail"
                            />
                            <span>{product.Product?.title || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="sold-count">{product.totalSold || 0}</span>
                        </td>
                        <td>
                          <span className="revenue-amount">
                            {adminService.formatCurrency(product.Product?.price * product.totalSold || 0)}
                          </span>
                        </td>
                        <td>
                          <span className={`stock-count ${product.Product?.stock < 10 ? 'low-stock' : ''}`}>
                            {product.Product?.stock || 0}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${product.Product?.stock > 20 ? 'in-stock' : product.Product?.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                            {product.Product?.stock > 20 ? 'Còn hàng' : product.Product?.stock > 0 ? 'Sắp hết' : 'Hết hàng'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Recent Activities */}
          <div className="activities-section">
            <div className="section-header">
              <h2>Hoạt động gần đây</h2>
              <button className="filter-btn">
                <Filter size={16} />
              </button>
            </div>
            <div className="activities-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className={`activity-item ${activity.type}`}>
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <p>{activity.message}</p>
                    <span className="activity-time">{formatTimeAgo(activity.time)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Summary */}
          {orderStats.ordersByStatus && (
            <div className="order-status-section">
              <div className="section-header">
                <h2>Thống kê đơn hàng</h2>
                <button className="settings-btn">
                  <Settings size={16} />
                </button>
              </div>
              <div className="status-grid">
                {orderStats.ordersByStatus.map((status, index) => (
                  <div key={index} className={`status-card ${status.status.toLowerCase().replace(' ', '-')}`}>
                    <div className="status-info">
                      <h3>{status.status}</h3>
                      <p className="status-count">{status.count}</p>
                    </div>
                    <div className="status-chart">
                      <div className="progress-ring">
                        <div className="progress-fill" style={{
                          transform: `rotate(${(status.count / overview.totalOrders) * 360}deg)`
                        }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="quick-actions">
            <div className="section-header">
              <h2>Thao tác nhanh</h2>
            </div>
            <div className="actions-grid">
              <button 
                className="action-btn export"
                onClick={handleExportOrders}
                disabled={loading}
              >
                <Download size={20} />
                <span>Xuất báo cáo</span>
              </button>
              <button 
                className="action-btn users"
                onClick={() => window.location.href = '/admin/users'}
              >
                <Users size={20} />
                <span>Quản lý người dùng</span>
              </button>
              <button 
                className="action-btn products"
                onClick={() => window.location.href = '/admin/products'}
              >
                <Package size={20} />
                <span>Quản lý sản phẩm</span>
              </button>
              <button 
                className="action-btn analytics"
                onClick={() => window.location.href = '/admin/analytics'}
              >
                <BarChart3 size={20} />
                <span>Xem thống kê</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;