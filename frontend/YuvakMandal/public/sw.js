// public/sw.js
self.addEventListener('push', (event) => {
  let data = { title: 'Yuvak Mandal Burahan', body: 'You have a new update', url: '/updates' };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (err) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      data: { url: data.url }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/updates';
  event.waitUntil(clients.openWindow(url));
});
