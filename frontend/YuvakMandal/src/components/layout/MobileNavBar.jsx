import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdNotifications, MdMenu } from 'react-icons/md';
import { FaUser, FaMoneyBill } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';

const MobileNavBar = ({ toggleSidebar, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  
  const isActive = (path) => {
    // If sidebar is open, only menu button should be active
    if (sidebarOpen && path === 'menu') {
      return true;
    }
    
    // If sidebar is open, other navigation items should not be active
    if (sidebarOpen && path !== 'menu') {
      return false;
    }
    
    // When sidebar is closed, determine active state based on current route
    return location.pathname === path;
  };
  
  // Handler for navigation buttons to close sidebar
  const handleNavClick = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center p-2 ${isActive('/') ? 'text-white' : 'text-gray-400'}`}
          onClick={handleNavClick}
        >
          <MdDashboard size={20} />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center p-2 ${isActive('/profile') ? 'text-white' : 'text-gray-400'}`}
          onClick={handleNavClick}
        >
          <FaUser size={18} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
        
        {!user?.isGuest ? <Link 
          to="/contributions" 
          className={`flex flex-col items-center justify-center p-2 ${isActive('/contributions') ? 'text-white' : 'text-gray-400'}`}
          onClick={handleNavClick}
        >
          <FaMoneyBill size={18} />
          <span className="text-xs mt-1">Contributions</span>
        </Link> : <></>}
        
        <button 
          onClick={toggleSidebar}
          className={`flex flex-col items-center justify-center p-2 ${isActive('menu') ? 'text-white' : 'text-gray-400'} hover:text-white`}
        >
          <MdMenu size={20} />
          <span className="text-xs mt-1">Menu</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavBar;