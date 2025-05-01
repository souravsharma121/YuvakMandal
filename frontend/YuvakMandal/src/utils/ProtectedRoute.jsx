// src/components/routing/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// Component to protect routes from guest users
const ProtectedFromGuest = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user && user.isGuest) {
    // Redirect guests to dashboard with a message
    return <Navigate to="/" state={{ message: "You need to be a member to access this area." }} />;
  }

  return children;
};

export default ProtectedFromGuest;