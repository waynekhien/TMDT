import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { ThemeProvider } from './context/ThemeContext';
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

// Pages
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Order from './pages/Order/Order';
import OrderDetail from './pages/Order/OrderDetail';
import Profile from './pages/Profile/Profile';
import UserProfile from './pages/UserProfile/UserProfile';
import SocialFeed from './pages/Social/SocialFeed';

// Admin Pages
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import UserManagement from './pages/Admin/UserManagement/UserManagement';
import ProductManagement from './pages/Admin/ProductManagement/ProductManagement';
import OrderManagement from './pages/Admin/OrderManagement/OrderManagement';

function App() {
  const [authState, setAuthState] = useState({
    username: "",
    id: 0,
    status: false,
    token: null
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      // Try to get from localStorage first
      let username = localStorage.getItem("username");
      let id = localStorage.getItem("id");
      let profilePicture = localStorage.getItem("profilePicture");

      // If not in localStorage, try to decode from token
      if (!username || !id) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          username = payload.username;
          id = payload.id;

          // Save to localStorage for next time
          if (username) localStorage.setItem("username", username);
          if (id) localStorage.setItem("id", id.toString());
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }

      const newAuthState = {
        username: username,
        id: parseInt(id) || 0,
        status: true,
        token: token,
        profilePicture: profilePicture
      };

      setAuthState(newAuthState);

      // Fetch fresh user data to get latest profile picture
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();

        // Update localStorage with fresh data
        if (userData.profilePicture) {
          localStorage.setItem("profilePicture", userData.profilePicture);
        } else {
          localStorage.removeItem("profilePicture");
        }

        // Update auth state with fresh profile picture
        setAuthState(prev => ({
          ...prev,
          profilePicture: userData.profilePicture
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  return (
    <ThemeProvider>
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <UIProvider>
          <div className="App">
            <BrowserRouter>
            <Routes>
              {/* Auth Routes (without navbar) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Admin Routes (without main navbar) */}
              <Route path="/admin" element={
                <PrivateRoute>
                  <AdminLayout />
                </PrivateRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Navigate to="/admin/users/page/1" replace />} />
                <Route path="users/page/:page" element={<UserManagement />} />
                <Route path="products" element={<Navigate to="/admin/products/page/1" replace />} />
                <Route path="products/page/:page" element={<ProductManagement />} />
                <Route path="orders" element={<Navigate to="/admin/orders/page/1" replace />} />
                <Route path="orders/page/:page" element={<OrderManagement />} />
              </Route>
              
              {/* Routes with navbar */}
              <Route path="/*" element={
                <div className="main-layout">
                  <NavBar />
                  <main className="main-content">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/page/:page" element={<Products />} />
                      <Route path="/products/:id" element={<ProductDetail />} />

                      {/* Social Routes */}
                      <Route path="/social" element={
                        <PrivateRoute>
                          <SocialFeed />
                        </PrivateRoute>
                      } />

                      {/* Protected Routes */}
                      <Route path="/profile" element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      } />
                      <Route path="/user/:userId" element={
                        <PrivateRoute>
                          <UserProfile />
                        </PrivateRoute>
                      } />
                      <Route path="/cart" element={
                        <PrivateRoute>
                          <Cart />
                        </PrivateRoute>
                      } />
                      <Route path="/checkout" element={
                        <PrivateRoute>
                          <Checkout />
                        </PrivateRoute>
                      } />
                      <Route path="/orders" element={
                        <PrivateRoute>
                          <Order />
                        </PrivateRoute>
                      } />
                      <Route path="/orders/:id" element={
                        <PrivateRoute>
                          <OrderDetail />
                        </PrivateRoute>
                      } />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </div>
      </UIProvider>
    </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;