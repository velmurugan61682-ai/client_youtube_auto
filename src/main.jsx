import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
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
const DEV_CACHE_CLEANUP_KEY = 'ChannelBot_dev_cache_cleanup_v4';
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

if (import.meta.env.PROD) {
  registerSW({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      console.log('[PWA] Service Worker ready:', swUrl);
      registration?.update();
    },
    onNeedRefresh() {
      window.dispatchEvent(new Event('sw-update-available'));
    },
    onOfflineReady() {
      console.log('[PWA] Offline app shell is ready');
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
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

