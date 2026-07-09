import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

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

if ('serviceWorker' in navigator) {
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
