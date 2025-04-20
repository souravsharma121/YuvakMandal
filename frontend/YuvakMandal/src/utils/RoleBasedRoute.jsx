import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, loading, user } = useAuth();  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(user.role)) {
    console.log(`Access denied for role: ${user.role}`);
    
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;