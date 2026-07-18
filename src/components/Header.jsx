import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Menu,
  LogOut,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  ThumbsUp,
  Clock,
  Trash2,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const EMPTY_ARRAY = [];

const Header = ({ toggleSidebar, onSearch, setActiveTab, notifications = EMPTY_ARRAY }) => {
  const { user, logout, switchOrg } = useAuth();
  const [localNotifications, setLocalNotifications] = useState(notifications);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

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
        console.error('Failed to switch organization:', err);
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
      default: return <MessageSquare size={14} className="text-[#22c55e]" />;
    }
  };

  return (
    <header className="h-[72px] bg-white/70 backdrop-blur-md border-b border-white/40 flex items-center justify-between px-6 sticky top-0 z-[100] transition-all">
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
          <div className="hidden sm:flex flex-col">
            <span className="text-[17px] font-black tracking-tighter text-[#0f0f0f]">CHANNELMATE</span>
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
             className={`p-2.5 hover:bg-[#f8f8f8] text-[#606060] rounded-2xl transition-all relative group ${showNotifications ? 'bg-[#f8f8f8] text-[#22c55e]' : ''}`}
           >
             <Bell size={20} className={showNotifications ? '' : 'group-hover:rotate-12 transition-transform'} />
             {notifications.length > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#22c55e] rounded-full border-2 border-white shadow-sm" />
             )}
           </button>

           <AnimatePresence>
             {showNotifications && (
               <>
                 {/* Backdrop overlay for mobile to tap outside to close */}
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 0.3 }}
                   exit={{ opacity: 0 }}
                   onClick={() => setShowNotifications(false)}
                   className="fixed inset-0 bg-[#0f0f0f] z-[190] sm:hidden"
                 />
                 
                 <motion.div 
                   initial={{ 
                     opacity: 0, 
                     x: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : 0, 
                     y: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : 10,
                     scale: typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 0.95 
                   }}
                   animate={{ 
                     opacity: 1, 
                     x: 0, 
                     y: 0,
                     scale: 1 
                   }}
                   exit={{ 
                     opacity: 0, 
                     x: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : 0, 
                     y: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : 10,
                     scale: typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 0.95 
                   }}
                   transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                   className="fixed right-0 top-0 h-[100vh] w-full max-w-[400px] bg-white z-[250] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col sm:absolute sm:right-0 sm:top-auto sm:h-auto sm:w-[360px] sm:max-w-[360px] sm:mt-3 sm:rounded-[32px] sm:bg-white/70 sm:backdrop-blur-md sm:border sm:border-white/50 sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] sm:z-[200] overflow-hidden"
                 >
                   {/* Sticky Header */}
                   <div className="p-5 border-b border-slate-100 sm:border-white/40 flex items-center justify-between bg-white sm:bg-white/40 sticky top-0 backdrop-blur-md z-10 pt-[calc(1.25rem+env(safe-area-inset-top))] sm:pt-5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-[#0f0f0f] text-base tracking-tight">AI Insights</h3>
                        <span className="bg-green-50 text-[#22c55e] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{localNotifications.length} New</span>
                      </div>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="p-1 hover:bg-[#f8f8f8] text-[#909090] hover:text-[#0f0f0f] rounded-lg transition-colors sm:hidden"
                      >
                        <X size={20} />
                      </button>
                   </div>
                   
                   {/* Scrollable Content */}
                   <div className="flex-1 overflow-y-auto scroll-smooth no-scrollbar sm:max-h-[400px] pb-[calc(100px+env(safe-area-inset-bottom))] sm:pb-0">
                      {localNotifications.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center">
                           <div className="w-12 h-12 bg-slate-50 sm:bg-white/40 rounded-2xl flex items-center justify-center text-[#cccccc] mb-3 border border-slate-100 sm:border-none">
                              <Bell size={24} />
                           </div>
                           <p className="text-[12px] font-bold text-[#909090]">No recent system alerts</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 sm:divide-white/40">
                          {localNotifications.map((notif, idx) => (
                            <motion.div 
                              key={notif._id || idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="p-4 hover:bg-slate-50/50 sm:hover:bg-white/50 transition-colors cursor-pointer group flex gap-3"
                              onClick={() => {
                                if (notif.type === 'like' || notif.type === 'new_comment') setActiveTab('moderation');
                                else if (notif.whatsappSent) setActiveTab('leads');
                                setShowNotifications(false);
                              }}
                            >
                               <div className="w-10 h-10 rounded-xl bg-slate-50 sm:bg-white/50 flex items-center justify-center shrink-0 border border-slate-100 sm:border-white/40 group-hover:border-[#22c55e]/10 group-hover:bg-green-50 transition-colors">
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
                   
                   {/* Fixed Bottom Footer/Action */}
                   <div className="absolute bottom-0 left-0 right-0 p-4 bg-white sm:bg-white/40 border-t border-slate-100 sm:border-white/40 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 z-10 flex gap-2">
                     <button 
                      onClick={() => { setLocalNotifications([]); }}
                      disabled={localNotifications.length === 0}
                      className="flex-1 py-3 bg-[#0f0f0f] text-white hover:bg-slate-800 disabled:opacity-50 text-[11px] font-black uppercase tracking-widest rounded-xl transition-colors text-center"
                     >
                        Mark All as Read
                     </button>
                     <button 
                      onClick={() => { setActiveTab('dashboard'); setShowNotifications(false); }}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-[#606060] text-[11px] font-black uppercase tracking-widest rounded-xl transition-colors text-center sm:hidden"
                     >
                        View Feed
                     </button>
                   </div>
                 </motion.div>
               </>
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

        <div className="h-8 w-px bg-[#f0f0f0] mx-2 hidden sm:block" />

        <div className="relative ml-2" ref={menuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 hover:bg-[#f8f8f8] rounded-2xl transition-all group"
          >
            <div className="hidden lg:flex flex-col items-end pr-1 max-w-[120px]">
              <span className="text-[13px] font-black text-[#0f0f0f] truncate w-full text-right">{user?.name || 'Channelmate'}</span>
              <span className="text-[9px] font-black text-[#2ba640] uppercase tracking-wider flex items-center gap-1 justify-end w-full">
                <div className="w-1.5 h-1.5 bg-[#2ba640] rounded-full animate-pulse" />
                channelmate
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0f0f0f] to-[#333] flex items-center justify-center text-white text-xs font-black shadow-md border border-white shrink-0 overflow-hidden">
              {user?.profilePicture ? (
                <img src={user.profilePicture} className="w-full h-full object-cover" alt="" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'A'
              )}
            </div>
            <ChevronDown size={14} className={`text-[#2ba640] transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-72 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[200] flex flex-col"
              >
                {/* Dark Header */}
                <div className="bg-[#0f172a] p-4 flex items-center gap-3 text-white text-left">
                   <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white font-black text-lg border border-white/20 shrink-0 overflow-hidden">
                     {user?.profilePicture ? (
                       <img src={user.profilePicture} className="w-full h-full object-cover" alt="" />
                     ) : (
                       user?.name?.charAt(0).toUpperCase() || 'A'
                     )}
                   </div>
                   <div className="min-w-0 flex-1">
                      <p className="text-sm font-black truncate">{user?.name || 'Channelmate'} (Channel Owner)</p>
                      <span className="text-[9px] font-black text-green-400 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-[#2ba640] rounded-full animate-pulse" />
                        channelmate
                      </span>
                   </div>
                </div>

                {/* Menu Options */}
                <div className="p-3 space-y-1 bg-white">
                  <button 
                    onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }} 
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Settings size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                      <span className="text-[13px] font-black text-slate-700 group-hover:text-slate-900 transition-colors">Account Settings</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>
                  
                  <button 
                    onClick={logout}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={18} className="text-red-500" />
                      <span className="text-[13px] font-black text-red-600">Logout Session</span>
                    </div>
                    <ChevronRight size={14} className="text-red-400" />
                  </button>
                </div>

                {/* Footer */}
                <div className="bg-[#f8fafc] py-3 text-center border-t border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Security Core v2.4
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
