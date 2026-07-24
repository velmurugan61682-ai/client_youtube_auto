import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

// Globally mute/intercept native browser alerts so they do not show popups
if (typeof window !== 'undefined') {
  window.alert = (msg) => {
    console.log('Intercepted alert:', msg);
  };
}


// Dev-only cleanup for stale PWA assets. Old service workers can keep serving a
// cached bundle on localhost and leave the landing page blank after UI edits.
const DEV_CACHE_CLEANUP_KEY = 'ChannelMate_dev_cache_cleanup_v4';
if (typeof window !== 'undefined' && import.meta.env.DEV && !sessionStorage.getItem(DEV_CACHE_CLEANUP_KEY)) {
  sessionStorage.setItem(DEV_CACHE_CLEANUP_KEY, '1');

  Promise.resolve().then(async () => {
    let cleaned = false;

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      cleaned = cleaned || registrations.length > 0;
    }

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      cleaned = cleaned || keys.length > 0;
    }

    if (cleaned) {
      window.location.reload();
    }
  }).catch((error) => {
    console.warn('[PWA] Dev cache cleanup failed:', error);
  });
}
// Cache-busting on new deployment
const BUILD_TIME = import.meta.env.VITE_BUILD_TIME || 'dev';
const lastBuildTime = localStorage.getItem('app_build_time');

if (lastBuildTime && lastBuildTime !== BUILD_TIME) {
  console.warn(`[PWA] New deployment detected (Old: ${lastBuildTime}, New: ${BUILD_TIME}). Purging old service workers and caches...`);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }

  if ('caches' in window) {
    caches.keys().then((keys) => {
      for (const key of keys) {
        caches.delete(key);
      }
    });
  }

  localStorage.setItem('app_build_time', BUILD_TIME);

  setTimeout(() => {
    window.location.reload();
  }, 200);
} else {
  localStorage.setItem('app_build_time', BUILD_TIME);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Listen for the controllerchange event to reload when a new service worker takes over
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[PWA] New Service Worker took control. Reloading...');
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('✓ Service Worker Ready');
        console.log('SW scope:', reg.scope);

        // Check for updates immediately
        reg.update();

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New Service Worker version available. Skipping waiting...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((err) => {
        console.error('SW registration failed:', err);
      });
  });
}

// Debugging logs for network connectivity and manifest
if (navigator.onLine) {
  console.log('✓ Network Connected');
}
window.addEventListener('online', () => console.log('✓ Network Connected'));
window.addEventListener('offline', () => console.log('❌ Network Disconnected'));

const manifestEl = document.querySelector('link[rel="manifest"]');
if (manifestEl) {
  console.log('✓ Manifest Loaded:', manifestEl.getAttribute('href'));
}

