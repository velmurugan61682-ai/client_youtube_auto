import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('✓ Service Worker Ready');
        console.log('SW scope:', reg.scope);
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.dispatchEvent(new CustomEvent('sw-update-available'));
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
