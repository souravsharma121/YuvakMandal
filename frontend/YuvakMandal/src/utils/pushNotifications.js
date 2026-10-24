// utils/pushNotifications.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const authHeaders = (token) => ({ headers: { 'x-auth-token': token } });

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
};

export const isPushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export const syncPushSubscription = async (token) => {
  if (!isPushSupported() || Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const { data } = await axios.get(`${baseURL}/api/push/public-key`, authHeaders(token));

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey)
    });
  }

  await axios.post(`${baseURL}/api/push/subscribe`, subscription.toJSON(), authHeaders(token));
};

export const enablePushNotifications = async (token) => {
  if (!isPushSupported()) {
    throw new Error('Notifications are not supported in this browser');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted');
  }

  await syncPushSubscription(token);
};

export const disablePushNotifications = async (token) => {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  await axios.post(
    `${baseURL}/api/push/unsubscribe`,
    { endpoint: subscription.endpoint },
    authHeaders(token)
  );
  await subscription.unsubscribe();
};
