// src/components/layout/Sidebar.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
// Import React Icons
import { FaUser, FaMoneyBill, FaSignOutAlt, FaLanguage, FaCloudSun } from 'react-icons/fa';
import { MdDashboard, MdPeople, MdApproval, MdNotifications, MdPersonAdd } from 'react-icons/md';
import logo from '../../assets/logo.png';

const scrollbarStyles = `
  .sidebar-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .sidebar-scrollbar::-webkit-scrollbar-track {
    background: #2d3748;
  }
  .sidebar-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4a5568;
    border-radius: 20px;
  }
  .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #718096;
  }
`;

const Sidebar = ({ isMobile, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };
  
  const handleMenuClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };
  
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isOpen: sidebarOpen } }));
    
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [sidebarOpen]);
  
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = scrollbarStyles;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  return (
    <>
      <aside 
         className={`
          fixed top-0 z-40 w-64 bg-gray-800 text-white transition-all duration-300 ease-in-out overflow-hidden
          ${isMobile ? 'bottom-16' : 'bottom-0'} 
          ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          ${isMobile ? 'max-w-[80%]' : ''}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-700 flex items-center justify-between">
            <img src={logo} alt="SDBSYM Logo" className="h-10 w-auto" />
          </div>
              
          <div className="flex-grow overflow-y-auto pb-16 sidebar-scrollbar">
            <div className="p-5">
              <nav className="space-y-2">
                <Link 
                  to="/" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActive('/')}`}
                  onClick={handleMenuClick}
                >
                  <MdDashboard className="mr-3" size={18} />
                  {t('dashboard')}
                </Link>
                
                <Link 
                  to="/profile" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActive('/profile')}`}
                  onClick={handleMenuClick}
                >
                  <FaUser className="mr-3" size={18} />
                  {t('profile')}
                </Link>

                <Link 
                  to="/weather" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActive('/weather')}`}
                  onClick={handleMenuClick}
                >
                  <FaCloudSun className="mr-3" size={18} />
                  {t('weather')}
                </Link>
                
                { !user?.isGuest ? <Link 
                  to="/notifications" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActive('/notifications')}`}
                  onClick={handleMenuClick}
                >
                  <MdNotifications className="mr-3" size={18} />
                  {t('notifications')}
                </Link> : <></>}
                
                {!user?.isGuest ? <Link 
                  to="/contributions" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActive('/contributions')}`}
                  onClick={handleMenuClick}
                >
                  <FaMoneyBill className="mr-3" size={18} />
                  {t('contributions')}
                </Link> : <></>}
                
                {/* Admin only links */}
                {user && user.role === 'Admin' && (
                  <div className="pt-4 mt-4 border-t border-gray-700">
                    <h3 className="px-4 text-sm text-gray-400 uppercase tracking-wider">{t('admin')}</h3>
                    <div className="mt-2 space-y-2">
                      <Link 
                        to="/admin/users" 
                        className={`flex items-center px-4 py-2 rounded-md ${isActive('/admin/users')}`}
                        onClick={handleMenuClick}
                      >
                        <MdPeople className="mr-3" size={18} />
                        {t('manageUsers')}
                      </Link>
                    </div>
                  </div>
                )}
                
                {/* Treasurer only links */}
                {user && (user.role === 'Treasurer' || user.role === 'Admin') && (
                    <div className="pt-4 mt-4 border-t border-gray-700">
                      <h3 className="px-4 text-sm text-gray-400 uppercase tracking-wider">{t('treasurer')}</h3>
                      <div className="mt-2 space-y-2">
                        <Link 
                          to="/contributions/approval" 
                          className={`flex items-center px-4 py-2 rounded-md ${isActive('/contributions/approval')}`}
                          onClick={handleMenuClick}
                        >
                          <MdApproval className="mr-3" size={18} />
                          {t('approveContributions')}
                        </Link>
                        
                        <Link 
                          to="/contributions/add-member" 
                          className={`flex items-center px-4 py-2 rounded-md ${isActive('/contributions/add-member')}`}
                          onClick={handleMenuClick}
                        >
                          <MdPersonAdd className="mr-3" size={18} />
                          {t('addMemberContribution')}
                        </Link>
                      </div>
                    </div>
                  )}
                
                {/* Links for users who can create notifications */}
                {user && ['Admin', 'Pradhan', 'Secretary', 'Treasurer', 'Core Member'].includes(user.role) && (
                  <div className="pt-4 mt-4 border-t border-gray-700">
                    <h3 className="px-4 text-sm text-gray-400 uppercase tracking-wider">{t('create')}</h3>
                    <div className="mt-2 space-y-2">
                      <Link 
                        to="/notifications/new" 
                        className={`flex items-center px-4 py-2 rounded-md ${isActive('/notifications/new')}`}
                        onClick={handleMenuClick}
                      >
                        <MdNotifications className="mr-3" size={18} />
                        {t('newNotification')}
                      </Link>
                    </div>
                  </div>
                )}
              {/* Language Toggle */}
              <div className="pt-4 mt-4 border-t border-gray-700">
                <h3 className="px-4 text-sm text-gray-400 uppercase tracking-wider">{t('language')}</h3>
                <div className="mt-2 space-y-2">
                  <button 
                    onClick={toggleLanguage}
                    className="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left"
                    aria-label="Toggle Language"
                  >
                    <FaLanguage className="mr-3" size={18} />
                    {i18n.language === 'en' ? 'हिंदी' : 'English'}
                  </button>
                </div>
              </div>
              </nav>
            </div>
          </div>
          
          <div className="w-full p-4 border-t border-gray-700 bg-gray-800 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                  {user?.image?.includes("https://res") ? (
                    <img
                      src={user.image}
                      alt={user.name || 'User'}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : user?.name ? (
                    <span className="text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <FaUser className="text-white" />
                  )}
                </div>

                <div>
                  <div className="text-sm font-medium">{user && user.name}</div>
                  <div className="text-xs text-gray-400">{user && user.role}</div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-300 hover:text-white rounded-md hover:bg-gray-700 transition-colors flex flex-col items-center"
                aria-label="Logout"
                title="Logout"
              >
                <FaSignOutAlt size={18} />
                <div className="text-xs text-gray-400 mt-1">{t('logout')}</div>
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Backdrop for mobile when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-opacity-30 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;