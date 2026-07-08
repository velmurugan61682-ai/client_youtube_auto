import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Mic, 
  Video, 
  Bell, 
  Menu,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Sparkles,
  Zap,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  ThumbsUp,
  Clock,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ toggleSidebar, onSearch, setActiveTab, sidebarOpen, notifications = [] }) => {
  const { user, logout, switchOrg } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      api.get('/auth/organizations')
        .then(res => setOrgs(res.data))
        .catch(err => console.error('Failed to load switcher orgs:', err));
    }
  }, [user]);

  const handleOrgChange = async (e) => {
    const orgId = e.target.value;
    if (orgId) {
      try {
        await switchOrg(orgId);
        window.location.reload();
      } catch (err) {
        alert('Failed to switch organization tenant.');
      }
    }
  };
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) onSearch(value);
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'like': return <ThumbsUp size={14} className="text-[#065fd4]" />;
      case 'delete': return <Trash2 size={14} className="text-[#d93025]" />;
      case 'flagged': return <AlertCircle size={14} className="text-[#f9ab00]" />;
      default: return <MessageSquare size={14} className="text-[#ff0000]" />;
    }
  };

  return (
    <header className="h-[72px] glass-panel border-b border-white/40 flex items-center justify-between px-6 sticky top-0 z-[100] transition-all">
      {/* Left: Branding */}
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar}
          className="p-2.5 hover:bg-[#f8f8f8] text-[#0f0f0f] rounded-2xl transition-all active:scale-90"
        >
          <Menu size={20} />
        </button>
        
        <div 
          onClick={() => setActiveTab && setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <img src="/logo.svg" className="w-9 h-9 object-contain" alt="Logo" />
          <div className="hidden sm:flex flex-col -gap-1">
            <span className="text-[17px] font-black tracking-tighter text-[#0f0f0f]">TECH VASEEGRAAH</span>
            <span className="text-[10px] font-black text-[#22c55e] tracking-[0.2em] -mt-1 uppercase opacity-80">CREATOR AI</span>
          </div>
        </div>

        {user && user.role === 'admin' && orgs.length > 0 && (
          <div className="ml-4 flex items-center gap-2 border-l border-zinc-200 pl-4">
            <select
              value={user.organizationId || ''}
              onChange={handleOrgChange}
              className="bg-zinc-100 hover:bg-zinc-200 border-none rounded-xl px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider outline-none transition-all text-zinc-700 cursor-pointer"
            >
              {orgs.map(org => (
                <option key={org._id} value={org._id}>{org.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-[600px] mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#909090] transition-colors group-focus-within:text-[#22c55e]" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search activity, leads, or video audits..."
            className="w-full glass-input rounded-2xl py-2.5 pl-12 pr-6 text-[14px] font-medium outline-none transition-all placeholder-[#adb5bd]"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
           <button 
             onClick={() => setShowNotifications(!showNotifications)}
             className={`p-2.5 hover:bg-[#f8f8f8] text-[#606060] rounded-2xl transition-all relative group ${showNotifications ? 'bg-[#f8f8f8] text-[#ff0000]' : ''}`}
           >
             <Bell size={20} className={showNotifications ? '' : 'group-hover:rotate-12 transition-transform'} />
             {notifications.length > 0 && (
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#22c55e] rounded-full border-2 border-white shadow-sm" />
             )}
           </button>

           <AnimatePresence>
             {showNotifications && (
               <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-[-48px] sm:right-0 mt-3 w-[calc(100vw-32px)] sm:w-[360px] max-w-[360px] glass-panel !bg-white/70 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-white/50 overflow-hidden z-[200]"
               >
                 <div className="p-5 border-b border-white/40 flex items-center justify-between bg-white/40 sticky top-0 backdrop-blur-md">
                    <h3 className="font-black text-[#0f0f0f] text-base tracking-tight">AI Insights</h3>
                    <span className="bg-green-50 text-[#22c55e] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{notifications.length} New</span>
                 </div>
                 
                 <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center">
                         <div className="w-12 h-12 bg-white/40 rounded-2xl flex items-center justify-center text-[#cccccc] mb-3">
                            <Bell size={24} />
                         </div>
                         <p className="text-[12px] font-bold text-[#909090]">No recent system alerts</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/40">
                        {notifications.map((notif, idx) => (
                          <motion.div 
                            key={notif._id || idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 hover:bg-white/50 transition-colors cursor-pointer group flex gap-3"
                            onClick={() => {
                              if (notif.type === 'like' || notif.type === 'new_comment') setActiveTab('moderation');
                              else if (notif.whatsappSent) setActiveTab('leads');
                              setShowNotifications(false);
                            }}
                          >
                             <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center shrink-0 border border-white/40 group-hover:border-[#22c55e]/10 group-hover:bg-green-50 transition-colors">
                                {getNotifIcon(notif.type)}
                             </div>
                             <div className="min-w-0 flex-1">
                                <p className="text-[12px] text-[#0f0f0f] font-medium leading-relaxed">
                                   <span className="font-black">@{notif.author || 'System'}</span> {notif.type === 'like' ? 'was auto-liked' : (notif.type === 'delete' ? 'was purged' : 'posted a new comment')}
                                </p>
                                <p className="text-[10px] text-[#909090] mt-0.5 flex items-center gap-1 font-bold">
                                   <Clock size={10} /> Just Now
                                </p>
                             </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                 </div>
                 
                 <button 
                  onClick={() => { setActiveTab('dashboard'); setShowNotifications(false); }}
                  className="w-full py-4 bg-white/40 border-t border-white/40 text-[11px] font-black text-[#606060] uppercase tracking-widest hover:bg-white/60 transition-colors"
                 >
                    View All Activity Feed
                 </button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-green-100 shadow-sm mr-2"
          >
            Install App
          </button>
        )}

        <button 
          onClick={() => setActiveTab('settings')}
          className="p-2.5 hover:bg-[#f8f8f8] text-[#606060] rounded-2xl transition-all group lg:mr-2"
          title="Settings"
        >
          <Settings size={20} className="group-hover:rotate-45 transition-transform duration-500" />
        </button>

        <div className="h-8 w-px bg-[#f0f0f0] mx-2 hidden sm:block" />

        <div className="relative ml-2" ref={menuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 hover:bg-[#f8f8f8] rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0f0f0f] to-[#333] flex items-center justify-center text-white text-xs font-black shadow-md border border-white">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden lg:flex flex-col items-start pr-1 max-w-[120px]">
              <span className="text-[13px] font-black text-[#0f0f0f] truncate w-full">{user?.name || 'Admin'}</span>
              <span className="text-[9px] font-black text-green-600 uppercase tracking-wider flex items-center gap-1">
                <div className="w-1 h-1 bg-[#2ba640] rounded-full animate-pulse" />
                {user?.role === 'admin' ? 'Admin' : (user?.subscription?.status === 'active' ? (user?.subscription?.planType || 'Pro') : 'Free Plan')}
              </span>
            </div>
            <ChevronDown size={14} className={`text-[#909090] transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-64 glass-panel !bg-white/70 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-white/50 overflow-hidden p-2 z-[200]"
              >
                <div className="p-4 mb-2 bg-white/40 rounded-2xl border border-white/45 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-[#ff0000] flex items-center justify-center text-white font-black text-lg">
                     {user?.name?.charAt(0).toUpperCase() || 'A'}
                   </div>
                   <div className="min-w-0">
                      <p className="text-sm font-black text-[#0f0f0f] truncate">{user?.name || 'Administrator'}</p>
                      <p className="text-[11px] text-[#909090] truncate font-medium">{user?.email}</p>
                   </div>
                </div>

                <div className="space-y-1">
                  <button onClick={() => { setActiveTab('dashboard'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8f8f8] rounded-xl text-[13px] font-bold text-[#606060] transition-all">
                    <LayoutDashboard size={18} /> Dashboard Overview
                  </button>
                  <button onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8f8f8] rounded-xl text-[13px] font-bold text-[#606060] transition-all">
                    <Sparkles size={18} /> UI Preferences
                  </button>
                </div>

                <div className="h-px bg-[#f0f0f0] my-2 mx-2" />

                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fff1f0] text-[#d93025] rounded-xl text-[13px] font-bold transition-all"
                >
                  <LogOut size={18} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
