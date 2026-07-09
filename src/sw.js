import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Clean up old caches automatically
cleanupOutdatedCaches();

// Precache all compiled assets (HTML, JS, CSS, images, etc.)
precacheAndRoute(self.__WB_MANIFEST || []);

// Handle external image caching (Google/YouTube avatars and thumbnails)
registerRoute(
  ({ url, request }) => 
    request.destination === 'image' && 
    (url.hostname.includes('ggpht.com') || 
     url.hostname.includes('ytimg.com') || 
     url.hostname.includes('googleusercontent.com')),
  new CacheFirst({
    cacheName: 'youtube-images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      })
    ]
  })
);

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push Notification Event Listener
self.addEventListener('push', (event) => {
  let data = { title: 'Notification', body: 'New updates from Tech Vaseegraah' };
  try {
    data = event.data ? event.data.json() : data;
  } catch (e) {
    data = { title: 'Notification', body: event.data ? event.data.text() : data.body };
  }
  
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const targetUrl = event.notification.data?.url || '/';
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
