import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import logo from '../../assets/logo.png'; // Adjust the path as necessary
import NotificationButton from './NotificationButton';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { t } = useTranslation();
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const onLogout = () => {
    logout();
  };
  
  const authLinks = (
    <>
      {/* Add NotificationButton here for mobile */}
      {isMobile && <NotificationButton />}
      
      {/* Desktop navigation links - hidden on mobile */}
      <div className="hidden md:block">
        <div className="ml-10 flex items-baseline space-x-4">
          <Link to="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            {t('dashboard')}
          </Link>
          <Link to="/profile" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            {t('profile')}
          </Link>
          {!user?.isGuest ? <Link to="/notifications" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            {t('notifications')}
          </Link> : <></>}
          {!user?.isGuest ? <Link to="/contributions" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            {t('contributions')}
          </Link> : <></>}
          {user && (user.role === 'Treasurer' || user.role === 'Admin') && (
            <>
              <Link to="/contributions/approval" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                {t('approveContributions')}
              </Link>
              <Link to="/contributions/add-member" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              {t('addMemberContribution')}
              </Link>
            </>
          )}
          {user && user.role === 'Admin' && (
            <Link to="/admin/users" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              {t('manageUsers')}
            </Link>
          )}
          <button onClick={onLogout} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            {t('logout')}
          </button>
        </div>
      </div>
    </>
  );
  
  return (
    <nav className={`bg-gray-800 ${isMobile ? 'fixed top-0 left-0 right-0 z-30' : ''}`}>
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