// src/components/auth/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

// Import background image and logo
import loginBg from '../../assets/splashbg.jpg'; 
import splashLogo from '../../assets/splashlogo.jpg';

const Login = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: ''
  });
  
  const { mobileNumber, password } = formData;
  const { login, guestLogin, isAuthenticated, error, clearError } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    if (error) {
      setAlert(error, 'danger');
      clearError();
    }
    // eslint-disable-next-line
  }, [isAuthenticated, error]);
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = e => {
    e.preventDefault();
    login({ mobileNumber, password });
  };

  const handleGuestLogin = () => {
    guestLogin();
  };

  const resetSelection = () => {
    setSelectedOption(null);
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
      
      <div className="max-w-6xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-2 border-white border-opacity-40 mb-6">
            <img
              src={splashLogo}
              alt="Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Jai Dev Balatika Shegal Yuvak Mandal</h1>
          <p className="text-xl text-white text-opacity-90">Welcome to our mandal portal</p>
        </div>
        
        {selectedOption === null ? (
          // Option Cards
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Already a Member Card */}
            <div 
              onClick={() => setSelectedOption('member')}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 cursor-pointer"
            >
              <div className="h-3 bg-blue-600"></div>
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Already a Member?</h3>
                <p className="text-gray-600 mb-4">Login to your account to access all features</p>
                <button className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors">
                  Login Now
                </button>
              </div>
            </div>
            
            {/* Continue as Guest Card */}
            <div 
              onClick={handleGuestLogin}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 cursor-pointer"
            >
              <div className="h-3 bg-green-500"></div>
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Continue as Guest</h3>
                <p className="text-gray-600 mb-4">Access basic information without an account</p>
                <button className="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600 transition-colors">
                  Continue
                </button>
              </div>
            </div>
            
            {/* Apply for Membership Card */}
            <div 
              onClick={() => setSelectedOption('apply')}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 cursor-pointer"
            >
              <div className="h-3 bg-purple-600"></div>
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Apply for Membership</h3>
                <p className="text-gray-600 mb-4">Join our community and get full access</p>
                <button className="bg-purple-600 text-white py-2 px-6 rounded hover:bg-purple-700 transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md mx-auto">
            {selectedOption === 'member' && (
              <div>
                <div className="h-3 bg-blue-600"></div>
                <div className="p-8">
                  <button 
                    onClick={resetSelection} 
                    className="text-gray-500 hover:text-gray-700 mb-6 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to options
                  </button>
                  
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Login to Your Account</h2>
                  <p className="text-gray-500 mb-6">Enter your credentials to access the mandal portal</p>
                  
                  <form className="space-y-4" onSubmit={onSubmit}>
                    <div>
                      <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                      <input
                        id="mobileNumber"
                        name="mobileNumber"
                        type="text"
                        autoComplete="tel"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter your registered mobile number"
                        value={mobileNumber}
                        onChange={onChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter your password"
                        value={password}
                        onChange={onChange}
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Login
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {selectedOption === 'apply' && (
              <div>
                <div className="h-3 bg-purple-600"></div>
                <div className="p-8">
                  <button 
                    onClick={resetSelection} 
                    className="text-gray-500 hover:text-gray-700 mb-6 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to options
                  </button>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">How to Apply</h3>
                  <p className="text-gray-600 mb-4">
                    To join Jai Dev Balatika Shegal Yuvak Mandal Burahan, please follow these steps:
                  </p>
                  <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
                    <li>Visit our office in person with your ID proof</li>
                    <li>Fill out the membership application form</li>
                    <li>Submit the required documents and fees</li>
                    <li>Wait for admin approval</li>
                    <li>Once approved, you'll receive login credentials via SMS</li>
                  </ol>
                  <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <p className="text-gray-700">
                      For more information, please contact our admin at <span className="text-blue-600 font-medium">+91 8219769590</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;