import React, { useState } from 'react';
import { 
  Youtube, 
  Mail, 
  Lock, 
  User, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap
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
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative font-['Outfit'] overflow-hidden selection:bg-red-600/30 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#ff0000]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#065fd4]/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-[32px] p-8 sm:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <Link to="/" className="flex flex-col items-center">
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="w-14 h-10 bg-red-600 flex items-center justify-center rounded-[10px] mb-4 shadow-[0_12px_24px_-8px_rgba(255,0,0,0.4)] cursor-pointer"
              >
                <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[12px] border-l-white border-b-[7px] border-b-transparent ml-1" />
              </motion.div>
              <h2 className="text-[24px] font-black text-white leading-tight mb-1 tracking-tighter">Create Creator Account</h2>
              <p className="text-white/60 text-[13px] font-semibold">Join the elite AI moderation community</p>
            </Link>
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-950/40 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-[12px] font-bold"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-[12px] font-bold"
              >
                <CheckCircle2 size={18} />
                Account created! Redirecting to login...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-red-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] text-white rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/5 transition-all placeholder-white/20"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-red-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] text-white rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/5 transition-all placeholder-white/20"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-red-500 transition-colors">
                    <Lock size={18} />
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
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Confirm</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-red-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.08] text-white rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/5 transition-all placeholder-white/20"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-[#ff0000] hover:bg-[#cc0000] disabled:bg-white/20 text-white font-black py-4 rounded-xl shadow-[0_12px_24px_-8px_rgba(255,0,0,0.4)] transition-all flex items-center justify-center gap-3 text-sm mt-6"
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
            <p className="text-[12px] font-bold text-white/50">
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

      <div className="mt-8 flex flex-col items-center gap-5 opacity-60 z-10">
         <div className="flex items-center gap-8 text-white/40 text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-2"><ShieldCheck size={14}/> AES-256 Encryption</span>
            <span className="flex items-center gap-2"><Zap size={14}/> AI Core v4.2</span>
         </div>
      </div>
    </div>
  );
};

export default Register;
