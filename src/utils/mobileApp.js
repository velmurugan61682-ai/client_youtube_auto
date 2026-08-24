export const isMobileApp = () => {
  if (typeof window === 'undefined') return false;
  return !!(
    window.AndroidBridge ||
    window.Android ||
    (window.webkit && window.webkit.messageHandlers) ||
    new URLSearchParams(window.location.search).get('platform') === 'mobile' ||
    localStorage.getItem('isMobileApp') === 'true'
  );
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
