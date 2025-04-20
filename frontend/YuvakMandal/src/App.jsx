import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { NotificationProvider } from './context/NotificationContext';
import { ContributionProvider } from './context/ContributionContext';
import PrivateRoute from './utils/PrivateRoute';
import RoleBasedRoute from './utils/RoleBasedRoute';
import setAuthToken from './utils/setAuthToken';
import './App.css';
// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Alert from './components/layout/Alert';
import SplashScreen from './components/layout/SplashScreen';
// Auth Components
import Login from './components/auth/Login';

// Dashboard Components
import Dashboard from './components/dashboard/Dashboard';
import UserProfile from './components/dashboard/UserProfile';
import ContributionCalendar from './components/dashboard/ContributionCalendar';

// Admin Components
import UserManagement from './components/admin/Usermanagement';
import UserForm from './components/admin/UserForm';

// Contribution Components
import ContributionList from './components/contributions/ContributionList';
import ContributionForm from './components/contributions/ContributionForm';
import Approval from './components/contributions/ApprovalList';

// Notification Components
import NotificationList from './components/notifications/NotificationList';
import NotificationForm from './components/notifications/NotificationForm';

// Check if token exists in local storage
if (localStorage.getItem('x-token')) {
  setAuthToken(localStorage.getItem('x-token'));
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [showSplash, setShowSplash] = useState(true);
  
  // Set auth token on page load and refresh
  useEffect(() => {
    const token = localStorage.getItem('x-token');
    if (token) {
      setAuthToken(token);
    }
  }, []);
  
  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (e) => {
      setSidebarOpen(e.detail.isOpen);
    };
    
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  // Function to handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash screen if showSplash is true
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <AuthProvider>
      <AlertProvider>
        <NotificationProvider>
          <ContributionProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Private Routes - authenticated users only */}
                <Route element={<PrivateRoute />}>
                  {/* Main Layout with Sidebar and Navbar */}
                  <Route path="/*" element={
                    <div className="flex flex-col min-h-screen bg-gray-100">
                      <Navbar />
                      <div className="flex flex-1 overflow-hidden">
                        <Sidebar />
                        {/* Main content area - shifted when sidebar is open */}
                        <main className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
                          <Alert />
                          <Routes>
                            {/* Dashboard */}
                            <Route index element={<Dashboard />} />
                            <Route path="profile" element={<UserProfile />} />
                            <Route path="calendar" element={<ContributionCalendar />} />
                            
                            {/* Contributions */}
                            <Route path="contributions" element={<ContributionList />} />
                            <Route path="contributions/new" element={<ContributionForm />} />
                            
                            {/* Treasurer Routes */}
                            <Route 
                              path="contributions/approval" 
                              element={
                                <RoleBasedRoute allowedRoles={['Admin', 'Treasurer']}>
                                  <Approval />
                                </RoleBasedRoute>
                              } 
                            />
                            
                            {/* Notifications */}
                            <Route path="notifications" element={<NotificationList />} />
                            <Route 
                              path="notifications/new" 
                              element={
                                <RoleBasedRoute allowedRoles={['Admin', 'Pradhan', 'Secretary', 'Treasurer', 'Core Member']}>
                                  <NotificationForm />
                                 </RoleBasedRoute>
                              } 
                            />
                            
                            {/* Admin Routes */}
                            <Route 
                              path="admin/users" 
                              element={
                                <RoleBasedRoute allowedRoles={['Admin']}>
                                  <UserManagement />
                                </RoleBasedRoute>
                              } 
                            />
                            <Route 
                              path="admin/users/new" 
                              element={
                                <RoleBasedRoute allowedRoles={['Admin']}>
                                  <UserForm />
                                </RoleBasedRoute>
                              } 
                            />
                            <Route 
                              path="admin/users/edit/:id" 
                              element={
                                <RoleBasedRoute allowedRoles={['Admin']}>
                                  <UserForm />
                                </RoleBasedRoute>
                              } 
                            />
                          </Routes>
                        </main>
                      </div>
                    </div>
                  } />
                </Route>
                
                {/* Redirect any unmatched routes to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </ContributionProvider>
        </NotificationProvider>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;