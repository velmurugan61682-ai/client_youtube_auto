import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

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
        const urlToken = params.get('token');
        const oauthStatus = params.get('status');
        const error = params.get('error');
        const channelId = params.get('channelId');

        // Handle explicit error parameter from server redirect
        if (oauthStatus === 'error' || error) {
          const msg = decodeURIComponent(error || 'Google login failed. Please try again.');
          setErrorMsg(msg);
          setStatus('error');
          setTimeout(() => window.location.replace('/login'), 3000);
          return;
        }

        const code = params.get('code');
        const state = params.get('state');

        // Handle direct Google redirect to frontend with auth code
        if (code) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          window.location.replace(`${apiUrl}/auth/callback/google?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`);
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
        const token = urlToken || localStorage.getItem('token');
        if (!token || token === 'null' || token === 'undefined') {
          setErrorMsg('No authentication token received. Please try logging in again.');
          setStatus('error');
          setTimeout(() => window.location.replace('/login'), 3000);
          return;
        }

        // Save token to localStorage immediately
        localStorage.setItem('token', token);

        // Verify token against /auth/me
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Save user data and redirect to dashboard
        if (res.data) {
          localStorage.setItem('user', JSON.stringify(res.data));
          setStatus('success');
          setTimeout(() => {
            window.location.replace('/dashboard');
          }, 600);
        } else {
          throw new Error('User profile verification failed');
        }

      } catch (err) {
        console.error('OAuth callback error:', err);
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
