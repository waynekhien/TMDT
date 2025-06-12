import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import axios from 'axios';
import './AdminLayout.css';

const AdminLayout = () => {
  const { authState, setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
  const checkAdminStatus = async () => {
      try {
        // Check if we have a token first
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // If authState is not ready yet, wait
        if (!authState.status) {
          return;
        }

        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.CHECK_STATUS}`, {
          headers: {
            accessToken: token
          }
        });

        if (response.data.isAdmin) {
          setIsAdmin(true);
        } else {
          setError('Bạn không có quyền truy cập trang quản trị');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error('Admin check error:', error);
        setError('Không thể xác minh quyền admin');
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [authState, navigate]);

  if (loading) {
    return <div className="admin-loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <ul>
            <li className={location.pathname === '/admin' || location.pathname === '/admin/dashboard' ? 'active' : ''}>
              <Link to="/admin/dashboard">Dashboard</Link>
            </li>
            <li className={location.pathname.includes('/admin/products') ? 'active' : ''}>
              <Link to="/admin/products/page/1">Sản phẩm</Link>
            </li>
            <li className={location.pathname.includes('/admin/orders') ? 'active' : ''}>
              <Link to="/admin/orders/page/1">Đơn hàng</Link>
            </li>
            <li className={location.pathname.includes('/admin/users') ? 'active' : ''}>
              <Link to="/admin/users/page/1">Người dùng</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="admin-content">
        <header className="admin-header">
          <div className="admin-header-title">
            {location.pathname === '/admin' && 'Dashboard'}
            {location.pathname.includes('/admin/products') && 'Quản lý sản phẩm'}
            {location.pathname.includes('/admin/orders') && 'Quản lý đơn hàng'}
            {location.pathname.includes('/admin/users') && 'Quản lý người dùng'}
          </div>          <div className="admin-user-info">
            <span>{authState.username}</span>
            <button onClick={() => navigate('/')}>Về trang chủ</button>
            <button onClick={() => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("username");
              localStorage.removeItem("id");
              setAuthState({ username: "", id: 0, status: false });
              navigate('/login');
            }}>Đăng xuất</button>
          </div>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;