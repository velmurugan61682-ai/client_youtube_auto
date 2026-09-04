import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Zap,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { getPlatformParam, openAuthUrl } from '../utils/mobileApp';

// Official 4-color Google "G" Icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.26v3.15C3.25 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.21 0 10.05 0 12s.46 3.79 1.26 5.39l4.02-3.15z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
  </svg>
);

const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleLoadingText, setGoogleLoadingText] = useState('Connecting to Google...');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Detect if we're inside an embedded iframe (switch account mode)
  const isEmbedded = new URLSearchParams(window.location.search).get('embed') === 'true';

  // Check URL search params for error message on return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get('status');
    const errorParam = params.get('error');
    if (statusParam === 'error' && errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    setGoogleLoadingText('Connecting to Google...');

    try {
      const timer = setTimeout(() => {
        setGoogleLoadingText('Redirecting securely...');
      }, 750);

      const response = await api.get(`/auth/google?flow=login${getPlatformParam()}`);
      clearTimeout(timer);

      if (response.data && response.data.redirectUrl) {
        setGoogleLoadingText('Redirecting securely...');
        openAuthUrl(response.data.redirectUrl);
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (err) {
      console.error('Google OAuth error:', err);
      setGoogleLoading(false);
      setError('Unable to connect to Google. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      setError('');
      try {
        const responseData = await login(email, password);
        const loggedUser = responseData?.user || responseData;

        // Admin accounts must use /admin/login – block them here
        if (loggedUser?.role === 'admin' || loggedUser?.role === 'superadmin') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setError('Admin accounts must use the Admin Portal. Go to /admin/login');
          return;
        }

        navigate('/dashboard');
      } catch (err) {
        if (!err.response) {
          setError('Unable to connect to the backend server. Please make sure the server is running.');
        } else {
          setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-zinc-900 flex items-center justify-center p-4 relative font-['Outfit'] overflow-hidden selection:bg-red-500/20 selection:text-red-900">

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Embedded switch-account banner */}
        {isEmbedded && (
          <div className="mb-4 flex items-center gap-2.5 bg-[#fff1f1] border border-red-100 rounded-xl px-4 py-3 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-[#ff0000]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
              </svg>
            </div>
            <p className="text-[11px] font-bold text-[#cc0000] leading-snug">
              Sign in to a different YouTube account to view its comments.
            </p>
          </div>
        )}

        <div className="bg-white border border-[#e5e5e5] rounded-[24px] p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] relative text-zinc-800 backdrop-blur-md">
          {/* Top Logo & Title Container */}
          <div className="flex flex-col items-center text-center mb-8">
            <Link to="/" className="flex flex-col items-center">
              <img src="/brand-logo.png" className="h-12 sm:h-14 w-auto object-contain mb-3" alt="ChannelBot Logo" />
              <p className="text-zinc-500 text-[13px] font-semibold">Sign in to your AI moderation centre</p>
            </Link>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                className="mb-6 p-3.5 bg-red-50/90 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-[12px] font-bold shadow-sm"
              >
                <AlertCircle size={17} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>



          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                Corporate Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-500/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 transition-all placeholder-zinc-400"
                  placeholder="creator@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                  Secure Password
                </label>
                <button type="button" className="text-[9px] font-black text-[#ff0000] uppercase tracking-widest hover:underline">
                  Reset?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-xl py-3 pl-12 pr-12 text-[14px] font-semibold focus:outline-none focus:border-red-500/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 transition-all placeholder-zinc-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || googleLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-[#ff0000] hover:bg-[#cc0000] disabled:bg-zinc-200 text-white font-black py-3.5 rounded-xl shadow-[0_12px_24px_-8px_rgba(255,0,0,0.3)] transition-all flex items-center justify-center gap-2 text-[14px] mt-6 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Sign in to Dashboard
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-white px-3 text-zinc-400">Or</span>
            </div>
          </div>

          {/* Google Sign-in Button */}
          <motion.button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-3 text-[14px] shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50"
          >
            {googleLoading ? (
              <>
                <Loader2 className="animate-spin text-zinc-500" size={18} />
                <span className="text-zinc-600 font-semibold">{googleLoadingText}</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </motion.button>

          {/* Card Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-[12px] font-bold text-zinc-500">
              Need a pro account?{' '}
              {onSwitchToRegister ? (
                <button
                  onClick={onSwitchToRegister}
                  className="text-red-500 hover:underline"
                >
                  Create Now
                </button>
              ) : (
                <Link
                  to="/register"
                  className="text-red-500 hover:underline font-bold"
                >
                  Create Now
                </Link>
              )}
            </p>

            <div className="pt-4 border-t border-zinc-100 text-[10px] font-medium text-zinc-400 leading-relaxed space-y-1">
              <p>
                By signing in or connecting YouTube, you agree to be bound by the{' '}
                <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-[#ff0000] font-bold hover:underline">
                  YouTube Terms of Service
                </a>.
              </p>
              <p>
                ChannelBot processes data according to the{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#ff0000] font-bold hover:underline">
                  Google Privacy Policy
                </a>. Revoke access via{' '}
                <a href="https://security.google.com/settings/security/permissions" target="_blank" rel="noopener noreferrer" className="text-[#ff0000] font-bold hover:underline">
                  Google Security Settings
                </a>.
              </p>
              <p className="text-[9px] text-zinc-400 font-semibold pt-0.5">
                Compliant with YouTube Developer Policies (Policy III.C.1 & Policy III.I.4 - 30-day retention & self-service data deletion available in Settings).
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Security & Version Badges */}
        <div className="mt-12 flex flex-col items-center gap-5 opacity-60">
          <div className="flex items-center gap-8 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-2"><ShieldCheck size={14} /> AES-256 Encryption</span>
            <span className="flex items-center gap-2"><Zap size={14} /> AI Core v4.2</span>
          </div>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">
            &copy; 2026 ChannelBot &bull; Global Systems LLC
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
