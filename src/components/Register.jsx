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
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      setTimeout(() => onSwitchToLogin(), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 relative font-['Inter']">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#ff0000]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#065fd4]/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[32px] p-8 sm:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-14 h-10 bg-red-600 flex items-center justify-center rounded-[10px] mb-6 shadow-[0_12px_24px_-8px_rgba(255,0,0,0.3)] cursor-pointer"
            >
              <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[12px] border-l-white border-b-[7px] border-b-transparent ml-1" />
            </motion.div>
            <h2 className="text-[26px] font-black text-[#0f0f0f] leading-tight mb-2 tracking-tighter">Create Creator Account</h2>
            <p className="text-[#606060] text-[14px] font-medium">Join the elite AI moderation community</p>
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-[#fce8e6] border border-[#f5c6cb] rounded-xl flex items-center gap-3 text-[#d93025] text-[12px] font-bold"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-[#e6f4ea] border border-[#b7e1cd] rounded-xl flex items-center gap-3 text-[#2ba640] text-[12px] font-bold"
              >
                <CheckCircle2 size={18} />
                Account created! Redirecting...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-[#909090] uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#909090] group-focus-within:text-red-600 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e9ecef] text-[#0f0f0f] rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-600/50 focus:bg-white transition-all placeholder-[#adb5bd]"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-[#909090] uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#909090] group-focus-within:text-red-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e9ecef] text-[#0f0f0f] rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-600/50 focus:bg-white transition-all placeholder-[#adb5bd]"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#909090] uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#909090] group-focus-within:text-red-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#e9ecef] text-[#0f0f0f] rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-600/50 focus:bg-white transition-all placeholder-[#adb5bd]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#909090] uppercase tracking-[0.2em] ml-1">Confirm</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#909090] group-focus-within:text-red-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#e9ecef] text-[#0f0f0f] rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-red-600/50 focus:bg-white transition-all placeholder-[#adb5bd]"
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
              className="w-full bg-[#0f0f0f] hover:bg-[#222222] disabled:bg-[#909090] text-white font-black py-4 rounded-xl shadow-[0_12px_24px_-8px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-3 text-sm mt-6"
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
            <p className="text-[12px] font-bold text-[#909090]">
              Already a member?{' '}
              <button 
                onClick={onSwitchToLogin}
                className="text-[#ff0000] hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-col items-center gap-3 opacity-60 z-10 font-black uppercase tracking-[0.2em] text-[10px] text-[#909090]">
        <span className="flex items-center gap-2"><ShieldCheck size={14}/> AI SECURED PLATFORM</span>
      </div>
    </div>
  );
};

export default Register;
