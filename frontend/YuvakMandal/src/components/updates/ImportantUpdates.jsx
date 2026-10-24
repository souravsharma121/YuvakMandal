// components/updates/ImportantUpdates.jsx
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import SkeletonLoader from '../loader/SkeletonLoader';
import { enablePushNotifications, isPushSupported } from '../../utils/pushNotifications';
import { FaBullhorn, FaPaperPlane, FaTrash, FaBell } from 'react-icons/fa';

const baseURL = import.meta.env.VITE_API_URL;

const UPDATE_ROLES = ['Admin', 'Pradhan', 'Up Pradhan', 'Secretary', 'Treasurer', 'Chief Advisor'];

const ImportantUpdates = () => {
  const { user, token } = useContext(AuthContext);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: '', message: '' });
  const [permission, setPermission] = useState(
    isPushSupported() ? Notification.permission : 'unsupported'
  );

  const canSend = !!user && UPDATE_ROLES.includes(user.role);
  const authConfig = { headers: { 'x-auth-token': token } };

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/updates`, authConfig);
        setUpdates(res.data);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to load updates');
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnable = async () => {
    try {
      await enablePushNotifications(token);
      toast.success('Notifications enabled on this browser');
    } catch (err) {
      toast.error(err.message || 'Could not enable notifications');
    } finally {
      setPermission(Notification.permission);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSending(true);
      const res = await axios.post(`${baseURL}/api/updates`, form, authConfig);
      setUpdates(prev => [res.data.update, ...prev]);
      setForm({ title: '', message: '' });
      toast.success(`Update sent. Delivered to ${res.data.pushResult.sent} browser(s).`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send update');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this update?')) return;

    try {
      await axios.delete(`${baseURL}/api/updates/${id}`, authConfig);
      setUpdates(prev => prev.filter(update => update._id !== id));
      toast.success('Update deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader type="text" size="lg" className="mb-6" />
        <SkeletonLoader type="user-card" count={3} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-800 flex items-center gap-3">
            <FaBullhorn /> Important Updates
          </h1>
          <p className="text-gray-600 mt-1">Announcements from the mandal leadership</p>
        </div>

        {isPushSupported() && permission !== 'granted' && (
          <button
            onClick={handleEnable}
            disabled={permission === 'denied'}
            className="inline-flex items-center justify-center bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-60"
          >
            <FaBell className="mr-2" />
            {permission === 'denied' ? 'Notifications blocked in browser settings' : 'Enable notifications'}
          </button>
        )}
      </div>

      {canSend && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Send an update</h2>

          <div className="mb-4">
            <label htmlFor="update-title" className="block text-gray-700 font-medium mb-2">Title *</label>
            <input
              id="update-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="update-message" className="block text-gray-700 font-medium mb-2">Message *</label>
            <textarea
              id="update-message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows="4"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-60"
          >
            <FaPaperPlane className="mr-2" />
            {sending ? 'Sending...' : 'Send to all members'}
          </button>
        </form>
      )}

      {updates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
          <p className="text-indigo-600 text-xl">No updates yet</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {updates.map(update => (
            <div key={update._id} className="bg-white rounded-lg shadow-md p-5 border-l-4 border-indigo-500">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-indigo-800">{update.title}</h3>
                  <p className="text-gray-700 mt-2 whitespace-pre-line">{update.message}</p>
                  <p className="text-xs text-gray-500 mt-3">
                    {update.createdBy?.name && `By ${update.createdBy.name} (${update.createdBy.role}) · `}
                    {new Date(update.createdAt).toLocaleString()}
                  </p>
                </div>
                {canSend && (
                  <button
                    onClick={() => handleDelete(update._id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Delete update"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImportantUpdates;
