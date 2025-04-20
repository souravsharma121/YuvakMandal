// src/components/layout/Navbar.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import logo from '../../assets/logo.png'; // Adjust the path as necessary
const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  
  const onLogout = () => {
    logout();
  };
  
  const authLinks = (
    <div className="hidden md:block">
      <div className="ml-10 flex items-baseline space-x-4">
        <Link to="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Dashboard
        </Link>
        <Link to="/profile" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Profile
        </Link>
        <Link to="/notifications" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Notifications
        </Link>
        <Link to="/contributions" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Contributions
        </Link>
        <Link to="/contributions/approval" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Approve Contributions
        </Link>
        {user && user.role === 'Admin' && (
          <Link to="/admin/users" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Manage Users
          </Link>
        )}
        {user && user.role === 'Treasurer' && (
          <Link to="/treasurer/approvals" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Approve Contributions
          </Link>
        )}
        <button onClick={onLogout} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Logout
        </button>
      </div>
    </div>
  );
  
  return (
    <nav className="bg-gray-800">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
  
          {/* Left section with logo and links */}
          <div className="flex items-center space-x-6">
            {/* Logo on far left */}
            <div className="flex-shrink-0">
              <img src={logo} alt="SDBSYM Logo" className="h-10 w-auto" />
            </div>
  
            {/* Authenticated navigation links (only if logged in) */}
            {isAuthenticated && authLinks}
          </div>
        </div>
      </div>
    </nav>
  );
  
};

export default Navbar;