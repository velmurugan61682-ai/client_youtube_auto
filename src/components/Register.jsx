import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

// Official 4-color Google "G" Icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.26v3.15C3.25 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.21 0 10.05 0 12s.46 3.79 1.26 5.39l4.02-3.15z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
  </svg>
);

const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleLoadingText, setGoogleLoadingText] = useState('Connecting to Google...');

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    setGoogleLoadingText('Connecting to Google...');

    try {
      const timer = setTimeout(() => {
        setGoogleLoadingText('Redirecting securely...');
      }, 750);

      const response = await api.get('/auth/google?flow=login');
      clearTimeout(timer);

      if (response.data && response.data.redirectUrl) {
        setGoogleLoadingText('Redirecting securely...');
        window.location.href = response.data.redirectUrl;
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
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => {
        if (onSwitchToLogin) {
          onSwitchToLogin();
        } else {
          navigate('/login');
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-zinc-900 flex items-center justify-center p-4 relative font-['Outfit'] overflow-hidden selection:bg-red-500/20 selection:text-red-900">

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-white border border-[#e5e5e5] rounded-[22px] p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden text-zinc-900">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <Link to="/" className="flex flex-col items-center">
              <img src="/brand-logo.png" className="h-12 sm:h-14 w-auto object-contain mb-3" alt="ChannelBot Logo" />
              <h2 className="text-[20px] font-black text-zinc-900 leading-tight mb-1 tracking-tighter">Create Creator Account</h2>
              <p className="text-zinc-500 text-[13px] font-semibold">Create and moderate with a YouTube-ready workspace</p>
            </Link>
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-650 text-[12px] font-bold shadow-sm"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-[#fff1f1] border border-red-100 rounded-xl flex items-center gap-3 text-[#0f7a35] text-[12px] font-bold shadow-sm"
              >
                <CheckCircle2 size={18} />
                Account created! Redirecting to login...
              </motion.div>
            )}
          </AnimatePresence>



          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-red-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/40 border border-zinc-200/80 text-zinc-900 rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-500/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 transition-all placeholder-zinc-400"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-red-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/40 border border-zinc-200/80 text-zinc-900 rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-500/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 transition-all placeholder-zinc-400"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-red-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/40 border border-zinc-200/80 text-zinc-900 rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-500/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 transition-all placeholder-zinc-400"
                    placeholder="Password"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Confirm</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-red-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/40 border border-zinc-200/80 text-zinc-900 rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-500/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 transition-all placeholder-zinc-400"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || googleLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-[#ff0000] hover:bg-[#cc0000] disabled:bg-zinc-200 text-white font-black py-4 rounded-xl shadow-[0_12px_24px_-8px_rgba(255,0,0,0.4)] transition-all flex items-center justify-center gap-3 text-sm mt-6"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Create Pro Account
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-[12px] font-bold text-zinc-500">
              Already a member?{' '}
              {onSwitchToLogin ? (
                <button
                  onClick={onSwitchToLogin}
                  className="text-red-500 hover:underline"
                >
                  Sign In
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-red-500 hover:underline font-bold"
                >
                  Sign In
                </Link>
              )}
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default Register;

