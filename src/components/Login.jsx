import React, { useState } from 'react';
import { 
  Youtube, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Globe,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  let navigate;
  try {
    navigate = useNavigate();
  } catch {
    navigate = (path) => {
      console.log('Navigating to:', path);
    };
  }

  // Detect if we're inside an embedded iframe (switch account mode)
  const isEmbedded = new URLSearchParams(window.location.search).get('embed') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      setError('');
      try {
        await login(email, password);
        console.log("Login successful");
        console.log("Navigating to dashboard...");
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative font-['Outfit'] overflow-hidden selection:bg-red-600/30 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#ff0000]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#065fd4]/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Embedded switch-account banner */}
        {isEmbedded && (
          <div className="mb-4 flex items-center gap-2.5 bg-[#065fd4]/10 border border-[#065fd4]/20 rounded-xl px-4 py-3">
            <div className="w-7 h-7 rounded-full bg-[#065fd4]/20 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
              </svg>
            </div>
            <p className="text-[11px] font-bold text-blue-400 leading-snug">
              Sign in to a different YouTube account to view its comments.
            </p>
          </div>
        )}

        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-[24px] p-8 sm:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] relative">
          {/* Top Logo Container */}
          <div className="flex flex-col items-center text-center mb-8">
            <Link to="/" className="flex flex-col items-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-16 h-11 bg-[#ff0000] flex items-center justify-center rounded-[10px] mb-4 shadow-[0_12px_24px_-8px_rgba(255,0,0,0.4)] relative group cursor-pointer"
              >
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
              </motion.div>
              <h1 className="text-[24px] font-black text-white leading-tight mb-1 tracking-tighter">Tech Vaseegraah Creator AI</h1>
              <p className="text-white/60 text-[13px] font-semibold">Sign in to your AI moderation centre</p>
            </Link>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 bg-red-950/40 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-[11px] font-bold"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">
                Corporate Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-red-500 transition-colors">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] text-white rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/5 transition-all placeholder-white/20"
                  placeholder="admin@youtubeai.test"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                  Secure Password
                </label>
                <button type="button" className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:underline">
                  Reset?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-red-500 transition-colors">
                  <Lock size={16} />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] text-white rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/5 transition-all placeholder-white/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-[#ff0000] hover:bg-[#cc0000] disabled:bg-white/20 text-white font-black py-3.5 rounded-xl shadow-[0_12px_24px_-8px_rgba(255,0,0,0.3)] transition-all flex items-center justify-center gap-2 text-[14px] mt-6 group"
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

          {/* Bottom Footer */}
          <div className="mt-8 text-center">
             <p className="text-[12px] font-bold text-white/50">
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
          </div>
        </div>

        {/* Bottom Security Badges */}
        <div className="mt-12 flex flex-col items-center gap-5 opacity-60">
           <div className="flex items-center gap-8 text-white/40 text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2"><ShieldCheck size={14}/> AES-256 Encryption</span>
              <span className="flex items-center gap-2"><Zap size={14}/> AI Core v4.2</span>
           </div>
           <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
             &copy; 2026 Tech Vaseegraah Creator AI &bull; Global Systems LLC
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;