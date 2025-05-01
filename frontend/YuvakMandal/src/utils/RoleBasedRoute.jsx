import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from '../components/loader/SkeletonLoader';

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, loading, user } = useAuth();  

  if (loading) {
        return (
          <div className="p-6">
            <SkeletonLoader type="text" size="lg" className="mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <SkeletonLoader type="dashboard-card" count={3} />
            </div>
            
            <div className="mt-10">
              <SkeletonLoader type="text" size="lg" className="mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <SkeletonLoader type="user-card" count={4} />
              </div>
            </div>
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