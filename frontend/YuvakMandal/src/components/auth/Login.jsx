// src/components/auth/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

// Import background image and logo
import loginBg from '../../assets/splashbg.jpg'; 
import splashLogo from '../../assets/splashlogo.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: ''
  });
  
  const { mobileNumber, password } = formData;
  const { login, isAuthenticated, error, clearError, logout, user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is guest, logout and show login form
    if (user?.isGuest) {
      logout();
      return;
    }
    
    // If user is authenticated as a real user, redirect to dashboard
    if (isAuthenticated && !user?.isGuest) {
      navigate('/dashboard');
    }
    
    if (error) {
      setAlert(error, 'danger');
      clearError();
    }
    // eslint-disable-next-line
  }, [isAuthenticated, error, user?.isGuest]);
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = e => {
    e.preventDefault();
    login({ mobileNumber, password });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 z-0"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-gray-900/60 z-0"></div>
      
      <div className="w-full relative z-10">
        {/* Back Button */}
        <div className="max-w-md mx-auto mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Login Form Container */}
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="h-3 bg-indigo-600"></div>
          <div className="p-8">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 mx-auto">
                <img
                  src={splashLogo}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
              <p className="text-gray-600 text-sm">Login to your Mandal account</p>
            </div>
            
            {/* Login Form */}
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="text"
                  autoComplete="tel"
                  required
                  className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  placeholder="Enter your registered mobile number"
                  value={mobileNumber}
                  onChange={onChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  placeholder="Enter your password"
                  value={password}
                  onChange={onChange}
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Sign In
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Don't have an account yet?
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Contact our admin to apply for membership
              </p>
              <p className="text-sm font-medium text-indigo-600">
                📞 +91 8219769590
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;