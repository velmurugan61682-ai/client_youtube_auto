import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Zap, 
  ToggleLeft, 
  ToggleRight, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  ThumbsUp,
  Key,
  Globe,
  Database,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('automation');
  const [autoMod, setAutoMod] = useState(true);
  const [autoLike, setAutoLike] = useState(true);
  const [threshold, setThreshold] = useState(85);
  const [languages, setLanguages] = useState(['English', 'Tamil', 'Tanglish']);
  const [realTimeAlerts, setRealTimeAlerts] = useState(true);
  
  // API Keys / Credentials
  const [credentials, setCredentials] = useState({
    youtubeApiKey: '',
    openaiApiKey: '',
    gowhatsApiKey: '',
    gowhatsUrl: '',
    productLink: ''
  });

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get('/settings');
      const { settings, credentials: savedCreds } = res.data;
      if (settings) {
        setAutoMod(settings.autoMod ?? true);
        setAutoLike(settings.autoLike ?? true);
        setThreshold(settings.confidenceThreshold ?? 85);
        setLanguages(settings.languages ?? ['English', 'Tamil', 'Tanglish']);
        setRealTimeAlerts(settings.realTimeAlerts ?? true);
      }
      if (savedCreds) {
        setCredentials({
          youtubeApiKey: savedCreds.youtubeApiKey || '',
          openaiApiKey: savedCreds.openaiApiKey || '',
          gowhatsApiKey: savedCreds.gowhatsApiKey || '',
          gowhatsUrl: savedCreds.gowhatsUrl || '',
          productLink: savedCreds.productLink || ''
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSavingSettings(true);
    setSuccessMessage('');
    try {
      if (activeTab === 'automation') {
        await api.post('/settings', {
          settings: {
            autoMod,
            autoLike,
            confidenceThreshold: threshold,
            languages,
            realTimeAlerts
          }
        });
      } else {
        await api.post('/settings/credentials', credentials);
      }
      setSuccessMessage('Configuration synchronized!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to sync configuration.');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#ff0000]" size={40} strokeWidth={2.5} />
          <p className="text-[10px] font-black text-[#909090] uppercase tracking-[0.2em]">Authenticating Core...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'automation', label: 'Automation Rules', icon: Zap },
    { id: 'credentials', label: 'API Credentials', icon: Key },
  ];

  return (
    <div className="w-full py-4 space-y-8 pb-16">
      {/* Premium Tab Switcher */}
      <div className="flex bg-white p-1 rounded-[24px] border border-[#f0f0f0] w-fit shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-[20px] text-[13px] font-black transition-all ${
              activeTab === tab.id 
                ? 'bg-[#0f0f0f] text-white shadow-lg shadow-black/10' 
                : 'text-[#909090] hover:text-[#0f0f0f] hover:bg-gray-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'automation' ? (
              <motion.div 
                key="automation"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="yt-card p-8"
              >
                <div className="flex items-center gap-4 mb-8 pb-5 border-b border-[#f8f8f8]">
                   <div className="w-12 h-12 bg-[#fff1f0] text-[#ff0000] rounded-2xl flex items-center justify-center">
                     <Sparkles size={24} />
                   </div>
                   <div>
                     <h3 className="text-[18px] font-black text-[#0f0f0f] tracking-tight">Intelligence Engine</h3>
                     <p className="text-[12px] font-medium text-[#909090]">Fine-tune your AI agent's decision logic.</p>
                   </div>
                </div>

                <div className="space-y-8">
                  {/* Toggles and Sliders go here (copied from previous refined version) */}
                  <div className="flex items-center justify-between gap-6">
                    <div className="max-w-[400px]">
                       <p className="text-[14px] font-black text-[#0f0f0f] mb-1">Smart Moderation</p>
                       <p className="text-[12px] text-[#909090] font-medium leading-relaxed">Automatically purge or hide toxic, abusive, or spam comments using neural analysis.</p>
                    </div>
                    <button 
                      onClick={() => setAutoMod(!autoMod)}
                      className={`relative w-14 h-8 rounded-full transition-colors flex items-center px-1 ${autoMod ? 'bg-[#ff0000]' : 'bg-[#e5e5e5]'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${autoMod ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-6 pt-6 border-t border-[#fcfcfc]">
                    <div className="max-w-[400px]">
                       <p className="text-[14px] font-black text-[#0f0f0f] mb-1">Auto-Engagement</p>
                       <p className="text-[12px] text-[#909090] font-medium leading-relaxed">Automatically "Like" positive and appreciative comments to boost SEO performance.</p>
                    </div>
                    <button 
                      onClick={() => setAutoLike(!autoLike)}
                      className={`relative w-14 h-8 rounded-full transition-colors flex items-center px-1 ${autoLike ? 'bg-[#065fd4]' : 'bg-[#e5e5e5]'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${autoLike ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-5 pt-6 border-t border-[#fcfcfc]">
                    <div className="flex items-center justify-between">
                       <p className="text-[14px] font-black text-[#0f0f0f]">Decision Confidence</p>
                       <span className="text-[13px] font-black text-[#ff0000] bg-[#fff1f0] px-3 py-1 rounded-lg">{threshold}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="99" 
                      value={threshold} 
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      className="w-full accent-[#ff0000] h-1.5 bg-[#f0f0f0] rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="credentials"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="yt-card p-8"
              >
                <div className="flex items-center gap-4 mb-8 pb-5 border-b border-[#f8f8f8]">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                     <Key size={24} />
                   </div>
                   <div>
                     <h3 className="text-[18px] font-black text-[#0f0f0f] tracking-tight">API Gateways</h3>
                     <p className="text-[12px] font-medium text-[#909090]">Synchronize your cloud service credentials.</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">YouTube Data V3 Key</label>
                      <div className="relative group">
                        <input 
                          type="password"
                          value={credentials.youtubeApiKey}
                          onChange={(e) => setCredentials({...credentials, youtubeApiKey: e.target.value})}
                          className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-2xl px-5 py-3.5 text-sm font-semibold focus:bg-white focus:border-[#ff0000]/20 transition-all outline-none"
                          placeholder="AIzaSy..."
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 opacity-20"><Youtube size={16} /></div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">OpenAI API Access Token</label>
                      <input 
                        type="password"
                        value={credentials.openaiApiKey}
                        onChange={(e) => setCredentials({...credentials, openaiApiKey: e.target.value})}
                        className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-2xl px-5 py-3.5 text-sm font-semibold focus:bg-white focus:border-blue-600/20 transition-all outline-none"
                        placeholder="sk-..."
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#fcfcfc]">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">GoWhats API Token</label>
                        <input 
                          type="password"
                          value={credentials.gowhatsApiKey}
                          onChange={(e) => setCredentials({...credentials, gowhatsApiKey: e.target.value})}
                          className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-2xl px-5 py-3.5 text-sm font-semibold focus:bg-white focus:border-green-600/20 transition-all outline-none"
                          placeholder="Token..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">GoWhats API URL</label>
                        <input 
                          type="text"
                          value={credentials.gowhatsUrl}
                          onChange={(e) => setCredentials({...credentials, gowhatsUrl: e.target.value})}
                          className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-2xl px-5 py-3.5 text-sm font-semibold focus:bg-white focus:border-green-600/20 transition-all outline-none"
                          placeholder="https://..."
                        />
                      </div>
                   </div>

                   <div className="space-y-2 pt-4 border-t border-[#fcfcfc]">
                      <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">Product/Service Destination Link</label>
                      <input 
                        type="text"
                        value={credentials.productLink}
                        onChange={(e) => setCredentials({...credentials, productLink: e.target.value})}
                        className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-2xl px-5 py-3.5 text-sm font-semibold focus:bg-white focus:border-[#0f0f0f]/20 transition-all outline-none"
                        placeholder="https://yourstore.com"
                      />
                      <p className="text-[10px] text-[#909090] ml-1">Used in automated WhatsApp responses and AI replies.</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Save Button */}
          <div className="flex items-center justify-between p-4 bg-[#fcfcfc] border border-[#f0f0f0] rounded-[24px]">
             <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${savingSettings ? 'bg-[#ff0000] animate-ping' : 'bg-[#2ba640]'}`} />
                <AnimatePresence>
                  {successMessage ? (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] font-black text-[#2ba640] uppercase tracking-tight">
                       {successMessage}
                    </motion.span>
                  ) : (
                    <span className="text-[12px] font-black text-[#909090] uppercase tracking-tight">System Ready to Sync</span>
                  )}
                </AnimatePresence>
             </div>
             <button 
              onClick={handleSave}
              disabled={savingSettings}
              className="px-8 py-3.5 bg-[#0f0f0f] hover:bg-[#222] text-white rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-black/10 transition-all disabled:opacity-50"
             >
               {savingSettings ? 'Securing Data...' : 'Commit Configuration'}
             </button>
          </div>
        </div>

        {/* Info/Side Column */}
        <div className="space-y-6">
           <div className="bg-[#0f0f0f] rounded-[32px] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                 <Lock size={80} />
              </div>
              <h4 className="text-[14px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Shield size={16} className="text-[#ff0000]" /> Security First
              </h4>
              <p className="text-[12px] text-white/60 leading-relaxed font-medium">
                 All keys are encrypted at rest using AES-256 GCM. Once stored, they are masked in the UI and never shared with third parties except for the specified API calls.
              </p>
              <div className="mt-8 pt-6 border-t border-white/10">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Encryption Level</span>
                    <span className="text-[10px] font-black text-[#2ba640] uppercase">Military Grade</span>
                 </div>
                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[100%] h-full bg-[#2ba640]" />
                 </div>
              </div>
           </div>

           <div className="bg-white border border-[#f0f0f0] rounded-[32px] p-8 space-y-6">
              <h4 className="text-[13px] font-black text-[#0f0f0f] uppercase tracking-widest">Why provide keys?</h4>
              <div className="space-y-4">
                 {[
                   { icon: Youtube, label: 'Fetch Comments', color: 'text-red-500' },
                   { icon: Sparkles, label: 'AI Sentiment Analysis', color: 'text-blue-500' },
                   { icon: Database, label: 'Sync to Local Cloud', color: 'text-gray-500' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className={`p-2 bg-gray-50 rounded-lg ${item.color}`}><item.icon size={16} /></div>
                      <span className="text-[12px] font-bold text-[#606060]">{item.label}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
const Youtube = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
