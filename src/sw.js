import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkOnly, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Clean up old caches automatically
cleanupOutdatedCaches();

// Precache all compiled assets (HTML, JS, CSS, images, etc.)
precacheAndRoute(self.__WB_MANIFEST || []);

// 1. Google Fonts Caching Strategy (StaleWhileRevalidate)
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 })
    ]
  })
);

// 2. NetworkFirst for Socket-synced API routes (Comments, Leads, Stats, Dashboard)
// Excludes OAuth redirects and Socket.IO to prevent stale authentication/token states
registerRoute(
  ({ url }) => {
    const isApi = url.pathname.startsWith('/api') || url.href.includes('/api');
    const isBackend = url.hostname.includes('server-youtube-auto.onrender.com');
    const isSocket = url.pathname.startsWith('/socket.io') || url.href.includes('/socket.io');
    const isBackendCallback = url.pathname.startsWith('/api/') && (url.pathname.includes('/callback') || url.pathname.includes('/connect'));
    return (isApi || isBackend) && !isSocket && !isBackendCallback;
  },
  new NetworkFirst({
    cacheName: 'api-network-first-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 })
    ]
  })
);

// 3. Socket.IO connections & Backend API OAuth Callbacks must ALWAYS be NetworkOnly
registerRoute(
  ({ url }) => 
    url.pathname.startsWith('/socket.io') || 
    url.href.includes('/socket.io') || 
    ((url.pathname.startsWith('/api') || url.hostname.includes('server-youtube-auto.onrender.com')) && 
     (url.pathname.includes('/callback') || url.pathname.includes('/connect'))),
  new NetworkOnly()
);

// Navigation fallback for SPA routing
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/api/, /^\/socket.io/],
});
registerRoute(navigationRoute);

// 4. Handle external Video Thumbnails (ytimg.com) using StaleWhileRevalidate
// Ensures modified YouTube thumbnails refresh in background without staying stale for 30 days
registerRoute(
  ({ url, request }) => request.destination === 'image' && url.hostname.includes('ytimg.com'),
  new StaleWhileRevalidate({
    cacheName: 'youtube-thumbnails-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 })
    ]
  })
);

// 5. Handle external Avatars (ggpht.com, googleusercontent.com) using CacheFirst
registerRoute(
  ({ url, request }) =>
    request.destination === 'image' &&
    (url.hostname.includes('ggpht.com') || url.hostname.includes('googleusercontent.com')),
  new CacheFirst({
    cacheName: 'youtube-avatars-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
  })
);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push Notification Event Listener
self.addEventListener('push', (event) => {
  let data = { title: 'Notification', body: 'New updates from ChannelBot' };

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

// Message event to skip waiting on command
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
