// src/components/auth/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

// Import background image - you'll need to add this file to your assets folder
// or adjust the path to match your project structure
import loginBg from '../../assets/splashbg.jpg'; // Create or add this image to your assets
import splashLogo from '../../assets/splashlogo.jpg'; // Create or add this image to your assets
const Login = () => {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: ''
  });
  
  const [showApplyInfo, setShowApplyInfo] = useState(false);
  const { mobileNumber, password } = formData;
  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);
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

  const toggleApplyInfo = () => {
    setShowApplyInfo(!showApplyInfo);
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
      
      <div className="max-w-4xl w-full relative z-10 flex flex-col md:flex-row">
        {/* Left Column - Welcome Message */}
        <div className="md:w-2/5 bg-gray-800 text-white p-8 rounded-t-lg md:rounded-l-lg md:rounded-tr-none shadow-lg">
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-2 border-white border-opacity-40 mb-6">
                <img
                        src={splashLogo}
                          alt="Logo"
                            className="w-full h-full object-cover rounded-full"
                          />
              </div>
              <h2 className="text-3xl font-bold mb-6">Welcome Back</h2>
              <p className="mb-6">Jai Dev Balatika Shegal Yuvak Mandal Burahan welcomes you to our community portal.</p>
            </div>
            
            <div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Login Form */}
        <div className="md:w-3/5 bg-white p-8 rounded-b-lg md:rounded-r-lg md:rounded-bl-none shadow-lg">
          {showApplyInfo ? (
            <div className="h-full flex flex-col justify-center">
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
              <p className="text-gray-600 mb-8">
                For more information, please contact our admin at <span className="text-blue-600">+91 8219769590</span>
              </p>
              <button 
                onClick={toggleApplyInfo}
                className="text-center py-2 px-6 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <div>
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
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Login
                  </button>
                </div>
              </form>
              
              <div className="mt-6">
                <button 
                  onClick={toggleApplyInfo}
                  className="text-center w-full py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Apply for Membership
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;