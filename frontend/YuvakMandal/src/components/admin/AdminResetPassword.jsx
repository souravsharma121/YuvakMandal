// components/admin/AdminResetPassword.jsx
import React, { useContext, useState } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

const baseURL = import.meta.env.VITE_API_URL;

const AdminResetPassword = ({ user, onClose }) => {
  const { token } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      return setAlert('Password must be at least 8 characters', 'danger');
    }

    if (newPassword !== confirmPassword) {
      return setAlert('Passwords do not match', 'danger');
    }

    try {
      setSubmitting(true);
      await axios.put(
        `${baseURL}/api/auth/admin/reset-password`,
        { userId: user._id, newPassword },
        { headers: { 'x-auth-token': token } }
      );
      setAlert(`Password reset for ${user.name}`, 'success');
      onClose();
    } catch (err) {
      setAlert(err.response?.data?.message || 'Failed to reset password', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-sm text-gray-500">Set a new password for {user.name}</p>
        </div>

        <input
          type="password"
          autoComplete="new-password"
          placeholder="New password (min 8 characters)"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          autoComplete="new-password"
          placeholder="Confirm new password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminResetPassword;
