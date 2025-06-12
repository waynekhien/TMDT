import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { authState } = useContext(AuthContext);
  
  // If we have a token but authState is not ready yet, show loading
  const hasToken = localStorage.getItem('accessToken');
  if (hasToken && !authState.status) {
    return <div>Loading...</div>;
  }
  
  return authState.status ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
