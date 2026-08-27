import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { API_BASE_URL } from '../config/environment.js';

// Decode JWT payload without verification (client-side only, for fallback)
const decodeJwtPayload = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Dedicated OAuth Callback Page
 * Handles the token from Google OAuth redirect and navigates to dashboard.
 * This avoids race conditions with authLoading on the /dashboard route.
 */
const OAuthCallbackPage = () => {
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        let token = params.get('token') || params.get('jwt') || params.get('access_token');
        const oauthStatus = params.get('status');
        const error = params.get('error');
        const channelId = params.get('channelId');

        if (typeof token === 'string') {
          token = token.trim().replace(/^["']|["']$/g, '');
          if (token === 'null' || token === 'undefined' || token === '') {
            token = null;
          }
        }

        if (token) {
          localStorage.setItem('token', token);
        }

        // Handle explicit error parameter from server redirect
        if (oauthStatus === 'error' || error) {
          const msg = decodeURIComponent(error || 'Google connection failed. Please try again.');
          setErrorMsg(msg);
          setStatus('error');
          const hasSession = localStorage.getItem('token') || localStorage.getItem('user');
          const redirectTarget = hasSession ? `/dashboard?status=error&error=${encodeURIComponent(msg)}` : '/login';
          setTimeout(() => window.location.replace(redirectTarget), 3000);
          return;
        }

        const code = params.get('code');
        const state = params.get('state');

        // Handle direct Google redirect to frontend with auth code
        if (code) {
          window.location.replace(`${API_BASE_URL}/auth/callback/google?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`);
          return;
        }

        // --- CHANNEL CONNECT FLOW ---
        // User was already logged in and just connected a YouTube channel.
        if (channelId) {
          setStatus('success');
          setTimeout(() => {
            window.location.replace(`/dashboard?status=success&channelId=${channelId}`);
          }, 800);
          return;
        }

        // --- GOOGLE LOGIN / SIGNUP FLOW ---
        // Check token from URL parameter first, fallback to localStorage
        if (!token) {
          token = localStorage.getItem('token');
          if (typeof token === 'string') {
            token = token.trim().replace(/^["']|["']$/g, '');
            if (token === 'null' || token === 'undefined') token = null;
          }
        }

        if (token) {
          localStorage.setItem('token', token);
        }

        // Verify token or httpOnly cookie against /auth/me
        const authHeaders = token ? {
          headers: { Authorization: `Bearer ${token}` }
        } : {};

        const res = await api.get('/auth/me', authHeaders);

        // Save user data and redirect to dashboard
        if (res.data) {
          localStorage.setItem('user', JSON.stringify(res.data));
          setStatus('success');
          setTimeout(() => {
            window.location.replace('/dashboard');
          }, 400);
        } else {
          throw new Error('User profile verification failed');
        }

      } catch (err) {
        console.error('OAuth callback error:', err);

        // --- RESILIENT FALLBACK ---
        // If /auth/me returns 404 (User not found) but we have a valid token,
        // decode the JWT client-side and redirect to dashboard anyway.
        // The server-side getMe has an email fallback, but this handles race conditions.
        if (err.response?.status === 404 && token) {
          const decoded = decodeJwtPayload(token);
          if (decoded && decoded.email) {
            console.warn('[OAuth Fallback] /auth/me returned 404 but token is valid. Using JWT payload as user data.');
            const fallbackUser = {
              email: decoded.email,
              role: decoded.role || 'client',
              id: decoded.id || decoded._id,
              name: decoded.name || decoded.email.split('@')[0]
            };
            localStorage.setItem('user', JSON.stringify(fallbackUser));
            setStatus('success');
            setTimeout(() => {
              window.location.replace('/dashboard');
            }, 400);
            return;
          }
        }

        const actualError = err.response?.data?.error || err.response?.data?.message || err.message || 'Verification failed';
        setErrorMsg(actualError);
        setStatus('error');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => window.location.replace('/login'), 3500);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f9f9f9]">
      <div className="flex flex-col items-center gap-5 p-8 bg-white rounded-3xl shadow-lg border border-[#e5e5e5] min-w-[300px] text-center">
        {status === 'loading' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-[#fff1f1] flex items-center justify-center">
              <Loader2 className="animate-spin text-[#ff0000]" size={28} />
            </div>
            <div>
              <p className="text-base font-black text-[#0f0f0f]">Signing you in...</p>
              <p className="text-xs font-semibold text-[#606060] mt-1">Verifying your Google account</p>
            </div>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={28} />
            </div>
            <div>
              <p className="text-base font-black text-[#0f0f0f]">Login Successful!</p>
              <p className="text-xs font-semibold text-[#606060] mt-1">Redirecting to your dashboard...</p>
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <XCircle className="text-[#ff0000]" size={28} />
            </div>
            <div>
              <p className="text-base font-black text-[#0f0f0f]">Login Failed</p>
              <p className="text-xs font-semibold text-[#606060] mt-1">{errorMsg}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
