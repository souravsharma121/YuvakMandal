// src/components/layout/Sidebar.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
// Import React Icons
import { FaBars, FaTimes, FaUser, FaMoneyBill, FaSignOutAlt } from 'react-icons/fa';
import { MdDashboard, MdPeople, MdApproval, MdNotifications } from 'react-icons/md';
import logo from '../../assets/logo.png'; // Import logo image

// Add custom scrollbar styles
const scrollbarStyles = `
  /* Sidebar scrollbar custom styling */
  .sidebar-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .sidebar-scrollbar::-webkit-scrollbar-track {
    background: #2d3748; /* Dark gray matching sidebar */
  }
  
  .sidebar-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4a5568; /* Slightly lighter gray for the thumb */
    border-radius: 20px;
  }
  
  .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #718096; /* Even lighter on hover */
  }
`;

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on mobile and set initial state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (!mobile) {
        setSidebarOpen(true); // Default open on desktop
      } else {
        setSidebarOpen(false); // Default closed on mobile
      }
    };
    
    // Run once on mount
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };
  
  // Handle menu item click - close sidebar on ALL screen sizes
  const handleMenuClick = () => {
    setSidebarOpen(false);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    setSidebarOpen(false); // Also close sidebar on logout
    navigate('/login'); // Redirect to login page after logout
  };
  
  // Add this class to the sidebar container to adjust main content margin
  useEffect(() => {
    // Add/remove class from body element to indicate sidebar state
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    // Dispatch custom event so parent components can adjust
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isOpen: sidebarOpen } }));
    
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [sidebarOpen]);
  
  // Inject custom scrollbar styles
  useEffect(() => {
    // Create style element and append to head
    const styleEl = document.createElement('style');
    styleEl.innerHTML = scrollbarStyles;
    document.head.appendChild(styleEl);
    
    // Cleanup
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  return (
    <>
      {/* Hamburger menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        aria-label="Toggle navigation"
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out overflow-hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Main sidebar content with flex structure and scrolling */}
        <div className="flex flex-col h-full">
          {/* Scrollable navigation area with custom scrollbar class */}
          <div className="p-5 border-b border-gray-700 flex items-center">
              <img src={logo} alt="SDBSYM Logo" className="h-10 w-auto" />
          </div>
              
          <div className="flex-grow overflow-y-auto pb-16 sidebar-scrollbar">
              {/* Navigation Links */}
            <div className="p-5">
              <nav className="space-y-2">
                <Link 
                  to="/" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActive('/')}`}
                  onClick={handleMenuClick}
                >
                  <MdDashboard className="mr-3" size={18} />
                  Dashboard
                </Link>
                
                <Link 
                  to="/profile" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActive('/profile')}`}
                  onClick={handleMenuClick}
                >
                  <FaUser className="mr-3" size={18} />
                  Profile
                </Link>
                
                <Link 
                  to="/notifications" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActive('/notifications')}`}
                  onClick={handleMenuClick}
                >
                  <MdNotifications className="mr-3" size={18} />
                  Notifications
                </Link>
                
                <Link 
                  to="/contributions" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActive('/contributions')}`}
                  onClick={handleMenuClick}
                >
                  <FaMoneyBill className="mr-3" size={18} />
                  Contributions
                </Link>
                
                {/* Admin only links */}
                {user && user.role === 'Admin' && (
                  <div className="pt-4 mt-4 border-t border-gray-700">
                    <h3 className="px-4 text-sm text-gray-400 uppercase tracking-wider">Admin</h3>
                    <div className="mt-2 space-y-2">
                      <Link 
                        to="/admin/users" 
                        className={`flex items-center px-4 py-2 rounded-md ${isActive('/admin/users')}`}
                        onClick={handleMenuClick}
                      >
                        <MdPeople className="mr-3" size={18} />
                        Manage Users
                      </Link>
                    </div>
                  </div>
                )}
                
                {/* Treasurer only links */}
                {user && (user.role === 'Treasurer' || user.role === 'Admin') && (
                  <div className="pt-4 mt-4 border-t border-gray-700">
                    <h3 className="px-4 text-sm text-gray-400 uppercase tracking-wider">Treasurer</h3>
                    <div className="mt-2 space-y-2">
                      <Link 
                        to="/contributions/approval" 
                        className={`flex items-center px-4 py-2 rounded-md ${isActive('/contributions/approval')}`}
                        onClick={handleMenuClick}
                      >
                        <MdApproval className="mr-3" size={18} />
                        Approve Contributions
                      </Link>
                    </div>
                  </div>
                )}
                
                {/* Links for users who can create notifications */}
                {user && ['Admin', 'Pradhan', 'Secretary', 'Treasurer', 'Core Member'].includes(user.role) && (
                  <div className="pt-4 mt-4 border-t border-gray-700">
                    <h3 className="px-4 text-sm text-gray-400 uppercase tracking-wider">Create</h3>
                    <div className="mt-2 space-y-2">
                      <Link 
                        to="/notifications/new" 
                        className={`flex items-center px-4 py-2 rounded-md ${isActive('/notifications/new')}`}
                        onClick={handleMenuClick}
                      >
                        <MdNotifications className="mr-3" size={18} />
                        New Notification
                      </Link>
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </div>
          
          {/* User profile section - fixed at bottom */}
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
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Logout"
                title="Logout"
              >
                <FaSignOutAlt size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Extremely low opacity overlay or no overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-5 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;