// Notifications: show what the server sent and open the app on tap. Texts come only from the server.
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data ? event.data.text() : '' }; }
  event.waitUntil(self.registration.showNotification(data.title || '', {
    body: data.body || '',
    icon: 'icon-192.png',
    badge: 'badge-96.png',
    data: { url: data.url || './' },
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || './', self.registration.scope).href;
  const home = target === self.registration.scope;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const c = list.find(x => x.url.startsWith(self.registration.scope) && 'focus' in x);
    if (!c) return self.clients.openWindow(target);
    // Already open: bring it forward; a link to a day reloads it there. navigate() refuses
    // a tab this worker does not control yet - then a new tab opens instead.
    return c.focus().then(w => (home ? w : (w || c).navigate(target)))
      .catch(() => self.clients.openWindow(target));
  }));
});
