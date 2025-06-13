import React, { useState, useContext, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../UI/ThemeToggle';
import {
  ShoppingBag,
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Home,
  Package,
  Users
} from 'lucide-react';
import './NavBar.css';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { authState, setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    localStorage.removeItem("id");
    localStorage.removeItem("profilePicture");
    setAuthState({ username: "", id: 0, status: false, token: null, profilePicture: null });
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const toggleUserMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle user menu clicked, current state:', isUserMenuOpen);
    console.log('AuthState:', authState);
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleProfileClick = () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate('/profile');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar">
      <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>      <div className={`links ${isMenuOpen ? 'active' : ''}`}>        <div className="leftSide">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            <Home size={18} /> Home Page
          </Link>
          <Link to="/products" onClick={() => setIsMenuOpen(false)}>
            <Package size={18} /> Products
          </Link>
          {authState.status && (
            <Link to="/social" onClick={() => setIsMenuOpen(false)}>
              <Users size={18} /> Social
            </Link>
          )}
        </div><div className="rightSide">          {authState.status ? (
            <>
              
              <Link to="/orders" onClick={() => setIsMenuOpen(false)}>
                <ShoppingBag size={18} /> Orders
              </Link>              
              <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                <ShoppingCart size={18} /> Cart
              </Link>

              <ThemeToggle />

              <div className="user-menu-container" ref={userMenuRef}>
                <div className="user-avatar" onClick={toggleUserMenu}>
                  {authState.profilePicture ? (
                    <img
                      src={`http://localhost:5000${authState.profilePicture}`}
                      alt={authState.username}
                      className="avatar-image"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      <User size={20} />
                    </div>
                  )}
                </div>

                {isUserMenuOpen && (
                  <div className="user-dropdown-simple">
                    <div className="user-info">
                      <span className="username">{authState.username}</span>
                    </div>
                    <hr />
                    <button onClick={handleProfileClick} className="dropdown-item">
                      <User size={16} /> Profile
                    </button>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="login-btn">
                <LogIn size={18} /> Đăng nhập
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="register-btn">
                <UserPlus size={18} /> Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NavBar
