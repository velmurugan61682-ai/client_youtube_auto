import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/admin/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4 relative font-['Outfit'] overflow-hidden">
<motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="bg-white p-8 sm:p-10 rounded-[28px] border border-[#e5e5e5] shadow-xl relative text-left">
          <div className="flex flex-col items-center text-center mb-8">
            <img src="/logo_icon.png" className="w-20 h-20 object-contain mb-3 drop-shadow-sm" alt="Channelbot Logo" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">ChannelBot Admin Console</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">Single-Admin System Security Portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold shadow-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full glass-input py-3 pl-11 pr-4 text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full glass-input py-3 pl-11 pr-4 text-xs font-bold outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glass-primary w-full py-3.5 mt-6 text-xs font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Authenticate Admin Access
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <Link to="/" className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
              &larr; Return to ChannelBot Main Website
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;


