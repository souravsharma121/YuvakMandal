// components/auth/ForgotPassword.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AlertContext from '../../context/AlertContext';
import Alert from '../layout/Alert';

const baseURL = import.meta.env.VITE_API_URL;

const inputClass =
  'appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';

const ForgotPassword = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${baseURL}/api/auth/forgot-password`, { email });
      setAlert(res.data.message, 'success');
      setStep(2);
    } catch (err) {
      setAlert(err.response?.data?.message || 'Something went wrong', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setAlert('Passwords do not match', 'danger');
    }

    try {
      setLoading(true);
      const res = await axios.post(`${baseURL}/api/auth/reset-password-otp`, {
        email,
        otp,
        newPassword
      });
      setAlert(res.data.message, 'success');
      navigate('/login');
    } catch (err) {
      setAlert(err.response?.data?.message || 'Password reset failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <Alert />

      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
            Back to Login
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="h-3 bg-indigo-600"></div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password</h2>

            {step === 1 && (
              <form className="space-y-4 mt-6" onSubmit={handleRequestCode}>
                <p className="text-sm text-gray-600">
                  Enter the email linked to your account. We will send a 6-digit code to it.
                </p>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={inputClass}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-4 mt-6" onSubmit={handleReset}>
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code sent to <span className="font-medium">{email}</span> and choose a new password.
                  The code expires in 10 minutes.
                </p>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    className={inputClass}
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className={inputClass}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className={inputClass}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Didn't get the code? Try again
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
