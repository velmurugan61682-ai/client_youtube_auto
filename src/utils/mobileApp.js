export const isMobileApp = () => {
  if (typeof window === 'undefined') return false;

  // 1. Native bridge objects injected by Android/iOS WebView app wrappers
  if (
    window.AndroidBridge ||
    window.Android ||
    (window.webkit && window.webkit.messageHandlers && Object.keys(window.webkit.messageHandlers).length > 0)
  ) {
    return true;
  }

  // 2. Explicit app flags in query params or localStorage
  const params = new URLSearchParams(window.location.search);
  if (
    params.get('platform') === 'mobile' ||
    params.get('isApp') === 'true' ||
    localStorage.getItem('isMobileApp') === 'true'
  ) {
    return true;
  }

  // 3. Embedded Android WebView user-agent marker (contains '; wv)' or 'WebView')
  const ua = navigator.userAgent || '';
  if (/;\s*wv\)/i.test(ua) || /WebView/i.test(ua)) {
    return true;
  }

  // Standard Mobile Chrome, Mobile Safari, and Chrome DevTools emulation return false
  return false;
};

export const getPlatformParam = () => {
  if (!isMobileApp()) return '';
  const ua = navigator.userAgent || '';
  const platform = /iPhone|iPad|iPod/i.test(ua) ? 'ios' : 'android';
  return `&platform=${platform}`;
};

export const openAuthUrl = (url) => {
  try {
    if (window.AndroidBridge?.openBrowser) return window.AndroidBridge.openBrowser(url);
    if (window.Android?.openBrowser) return window.Android.openBrowser(url);
    if (window.webkit?.messageHandlers?.openBrowser) return window.webkit.messageHandlers.openBrowser.postMessage(url);
  } catch (e) {
    console.warn('Native bridge openAuthUrl failed, falling back to location redirect', e);
  }
  // Safe fallback that always works even if no bridge exists: normal navigation.
  window.location.href = url;
};
