import React, { useState } from 'react';
import { 
  Youtube, 
  Key, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Settings,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const ChannelConnection = ({ channels, setChannels }) => {
  const [apiKey, setApiKey] = useState('');
  const [channelId, setChannelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleOAuthConnect = () => {
    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || (isProd ? window.location.origin : 'http://localhost:5000');
    
    if (isProd && !import.meta.env.VITE_API_URL) {
      alert("⚠️ Production Configuration Error: The backend URL is not set in Vercel. Please follow the deployment instructions provided by the AI.");
      return;
    }
    
    window.location.href = `${apiBase}/api/youtube/auth`;
  };

  const handleApiKeyConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/settings/youtube', {
        apiKey,
        channelId
      });
      setSuccess('Channel linked successfully!');
      setApiKey('');
      setChannelId('');
      
      const channelsRes = await api.get('/youtube/channels');
      setChannels(channelsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Validation failed. Check API Key.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (id) => {
    if (!window.confirm('Disconnect this channel? AI protection will stop instantly.')) return;
    try {
      await api.delete(`/youtube/channels/${id}`);
      setChannels(prev => prev.filter(c => c.channelId !== id));
    } catch (err) {
      alert('Failed to disconnect.');
    }
  };

  return (
    <div className="space-y-10 pb-20 w-full mx-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1.5 h-1.5 bg-[#ff0000] rounded-full" />
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#909090]">Global Connectivity</span>
          </div>
          <h2 className="text-3xl font-black text-[#0f0f0f] tracking-tight">Channel Hub</h2>
        </div>
        <div className="flex items-center gap-3 bg-white border border-[#f0f0f0] p-1.5 rounded-2xl shadow-sm">
           <div className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${channels.length > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
              {channels.length} Profiles Active
           </div>
           <div className="h-4 w-px bg-[#f0f0f0]" />
           <div className="px-4 py-1.5 text-[11px] font-black text-[#909090] uppercase tracking-wider">
              Uptime: 99.9%
           </div>
        </div>
      </div>

      {/* Main Connection Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* OAuth Card: Streamlined */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-[#0f0f0f] rounded-[32px] p-8 shadow-2xl shadow-black/10 overflow-hidden flex flex-col md:flex-row items-center gap-8 group"
        >
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
             <Youtube size={140} className="text-white" />
          </div>
          
          <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center text-[#ff0000] shadow-xl shrink-0 rotate-3 group-hover:rotate-0 transition-transform">
            <Youtube size={44} fill="currentColor" />
          </div>

          <div className="flex-1 text-center md:text-left relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
              <h3 className="text-xl font-black text-white tracking-tight">Direct Studio Connect</h3>
              <span className="px-3 py-0.5 bg-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest rounded-full border border-white/10">
                Recommended
              </span>
            </div>
            <p className="text-white/60 text-[13px] font-medium leading-relaxed mb-6 max-w-[320px]">
              Authorize AI to manage moderation and engagement directly through the Studio API.
            </p>
            <button 
              onClick={handleOAuthConnect}
              className="w-full md:w-auto bg-[#ff0000] text-white py-3 px-8 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-[#0f0f0f] transition-all flex items-center justify-center gap-2 group/btn"
            >
              Link Now <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* API Key Card: Compact Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-[32px] border border-[#f0f0f0] p-8 shadow-sm flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f8f9fa] text-[#0f0f0f] rounded-2xl flex items-center justify-center">
                <Key size={24} />
              </div>
              <div>
                <h4 className="text-[17px] font-black text-[#0f0f0f] tracking-tight">Manual Key Sync</h4>
                <p className="text-[10px] text-[#909090] font-black uppercase tracking-widest">Read-Only Backup</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleApiKeyConnect} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-[#909090] uppercase tracking-widest ml-1">V3 API Token</label>
              <input 
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-xl py-2.5 px-4 text-sm font-semibold focus:bg-white focus:border-[#0f0f0f]/20 transition-all outline-none"
                placeholder="Paste key..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-[#909090] uppercase tracking-widest ml-1">Channel ID</label>
              <input 
                type="text"
                required
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-xl py-2.5 px-4 text-sm font-semibold focus:bg-white focus:border-[#0f0f0f]/20 transition-all outline-none"
                placeholder="UC..."
              />
            </div>
            <div className="md:col-span-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-white border border-[#0f0f0f] text-[#0f0f0f] font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-[#0f0f0f] hover:text-white transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : "Validate & Sync"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Profile Management Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-[#0f0f0f] tracking-tight">Active Profiles</h3>
              <div className="h-5 w-px bg-[#f0f0f0]" />
              <span className="text-[10px] font-black text-[#909090] uppercase tracking-widest">Managed Clusters</span>
           </div>
        </div>

        {channels.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-[#fcfcfc] border-2 border-dashed border-[#f0f0f0] rounded-[40px] group hover:border-[#ff0000]/20 transition-colors">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#cccccc] mb-6 group-hover:scale-110 transition-transform">
               <Globe size={32} />
            </div>
            <h4 className="text-[16px] font-black text-[#0f0f0f] mb-1">No Channels Detected</h4>
            <p className="text-[12px] text-[#909090] font-medium max-w-[280px]">Link a YouTube profile above to activate the AI Guardian network.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {channels.map((channel) => (
                <motion.div 
                  key={channel.channelId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border border-[#f0f0f0] rounded-[32px] p-6 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <img src={channel.thumbnailUrl} className="w-16 h-16 rounded-[22px] border-2 border-white shadow-md bg-[#f8f8f8]" alt="" />
                      <div className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-lg border border-[#f0f0f0]">
                        {channel.apiKey ? <Key size={12} className="text-[#909090]" /> : <ShieldCheck size={12} className="text-[#ff0000]" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-[16px] font-black text-[#0f0f0f] truncate mb-2">{channel.title}</h4>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${channel.apiKey ? 'bg-slate-50 text-slate-500 border border-slate-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          {channel.apiKey ? 'Data Read' : 'Core Secure'}
                        </span>
                        <div className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span className="text-[10px] text-[#909090] font-black uppercase">LIVE</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[#f8f8f8] flex items-center justify-between">
                     <div className="flex gap-2">
                        <a 
                          href={`https://youtube.com/channel/${channel.channelId}`} 
                          target="_blank" 
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f9fa] hover:bg-[#ff0000]/5 text-[#606060] hover:text-[#ff0000] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          <ExternalLink size={14} /> Open Studio
                        </a>
                     </div>
                     <button 
                        onClick={() => handleDisconnect(channel.channelId)}
                        className="p-2 text-[#909090] hover:text-[#d93025] hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Security Footer Banner */}
      <div className="p-8 bg-gradient-to-tr from-[#0f0f0f] to-[#333] rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-black/10">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
               <ShieldCheck size={28} className="text-[#2ba640]" />
            </div>
            <div>
               <h3 className="text-xl font-black tracking-tight">Enterprise Infrastructure</h3>
               <p className="text-white/40 text-[12px] font-medium">Encrypted tunnels and 256-bit secure cloud sync active.</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
               Region: Global
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
               Protocol: SSL/TLS
            </div>
         </div>
      </div>
    </div>
  );
};

export default ChannelConnection;
