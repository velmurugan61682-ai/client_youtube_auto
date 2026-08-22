import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Bump Service Worker cache version tag to invalidate previously registered stale SWs on clients
const SW_CACHE_VERSION = 'v2_oauth_callback_bypass_v2';

// Clean up old caches automatically
cleanupOutdatedCaches();

// Precache all compiled assets (HTML, JS, CSS, images, etc.)
precacheAndRoute(self.__WB_MANIFEST || []);

// 1. Google Fonts Caching Strategy (StaleWhileRevalidate)
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: `google-fonts-cache-${SW_CACHE_VERSION}`,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 })
    ]
  })
);

// 2. Dynamic API, OAuth, callback routes, and token-bearing navigations must always hit the network.
registerRoute(
  ({ url }) => 
    url.pathname.startsWith('/socket.io') || 
    url.href.includes('/socket.io') || 
    url.pathname.startsWith('/api') ||
    url.href.includes('/api') ||
    url.pathname.includes('/oauth/') ||
    url.pathname.includes('/auth/') ||
    url.searchParams.has('token') ||
    url.searchParams.has('jwt') ||
    url.searchParams.has('code') ||
    url.searchParams.has('access_token') ||
    url.hostname.includes('server-youtube-auto.onrender.com'),
  new NetworkOnly()
);

// Navigation fallback for SPA routing.
// IMPORTANT: /oauth/callback, /auth/callback, and URLs containing token query parameters MUST be in the denylist.
// The Service Worker's createHandlerBoundToURL serves a cached /index.html for any
// intercepted navigation — which silently strips the entire query string from the URL if intercepted.
// By denylisting these routes and URL patterns, the browser fetches them directly from the network (Vercel/server),
// preserving the full URL including query parameters (token, code, state).
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [
    /^\/api/, 
    /^\/socket\.io/, 
    /.*\/oauth\/.*/, 
    /.*\/auth\/.*/, 
    /[?&](token|jwt|code|access_token)=/
  ],
});
registerRoute(navigationRoute);

// 3. Handle external Video Thumbnails (ytimg.com) using NetworkOnly
// Lets browser fetch thumbnails directly from YouTube's CDN so missing thumbnails trigger 404/onError without SW 500 errors
registerRoute(
  ({ url, request }) => request.destination === 'image' && url.hostname.includes('ytimg.com'),
  new NetworkOnly()
);

// 4. Handle external Avatars (ggpht.com, googleusercontent.com) using CacheFirst
registerRoute(
  ({ url, request }) =>
    request.destination === 'image' &&
    (url.hostname.includes('ggpht.com') || url.hostname.includes('googleusercontent.com')),
  new CacheFirst({
    cacheName: `youtube-avatars-cache-${SW_CACHE_VERSION}`,
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
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => !cacheName.includes(SW_CACHE_VERSION))
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
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
