// components/notifications/NotificationGate.jsx
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import {
  enablePushNotifications,
  syncPushSubscription,
  isPushSupported
} from '../../utils/pushNotifications';

const currentPermission = () => (isPushSupported() ? Notification.permission : 'unsupported');

const NotificationGate = () => {
  const { user, token } = useContext(AuthContext);
  const [permission, setPermission] = useState(currentPermission);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isMember = !!user && !user.isGuest;

  useEffect(() => {
    if (!isMember) return;

    const refresh = () => setPermission(currentPermission());
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [isMember]);

  useEffect(() => {
    if (isMember && token && permission === 'granted') {
      syncPushSubscription(token).catch(err => console.error('Push sync failed:', err));
    }
  }, [isMember, token, permission]);

  if (!isMember || permission === 'granted') return null;

  const handleEnable = async () => {
    try {
      setBusy(true);
      setError('');
      await enablePushNotifications(token);
    } catch (err) {
      setError(err.message || 'Could not enable notifications');
    } finally {
      setPermission(currentPermission());
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/90 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-indigo-800 mb-3">Notifications are required</h2>

        {permission === 'default' && (
          <>
            <p className="text-gray-600 mb-6">
              Allow notifications to receive important updates from the mandal. You cannot use the app until this is allowed.
            </p>
            <button
              onClick={handleEnable}
              disabled={busy}
              className="w-full py-3 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? 'Enabling...' : 'Allow notifications'}
            </button>
          </>
        )}

        {permission === 'denied' && (
          <>
            <p className="text-gray-600 mb-6">
              Notifications are blocked for this site. Open your browser's site settings, allow notifications for this site, then come back here.
            </p>
            <button
              onClick={() => setPermission(currentPermission())}
              className="w-full py-3 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
            >
              I have allowed notifications
            </button>
          </>
        )}

        {permission === 'unsupported' && (
          <p className="text-gray-600">
            This browser cannot receive notifications. On iPhone, open this site in Safari, tap Share, choose Add to Home Screen, then open the app from your home screen.
          </p>
        )}

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default NotificationGate;
