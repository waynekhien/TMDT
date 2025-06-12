import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus,
  Home,
  Package
} from 'lucide-react';
import './NavBar.css';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { authState, setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    localStorage.removeItem("id");
    setAuthState({ username: "", id: 0, status: false });
    setIsMenuOpen(false);
    navigate('/login');
  };

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
        </div><div className="rightSide">          {authState.status ? (
            <>
              
              <Link to="/orders" onClick={() => setIsMenuOpen(false)}>
                <ShoppingBag size={18} /> Orders
              </Link>              
              <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                <ShoppingCart size={18} /> Cart
              </Link>
              
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                <User size={18} /> Profile
              </Link>
              
              <button onClick={handleLogout} className="logout-button">
                <LogOut size={18} /> Logout
              </button>
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
