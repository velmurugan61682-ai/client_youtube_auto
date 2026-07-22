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

const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  let navigate;
  try {
    navigate = useNavigate();
  } catch {
    navigate = (path) => {
      console.log('Navigating to:', path);
    };
  }

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
              <img src="/channelmate_logo.png" className="h-12 sm:h-14 w-auto object-contain mb-3" alt="Channelmate Logo" />
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
              disabled={loading}
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

