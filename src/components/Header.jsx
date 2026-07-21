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
  X,
  PlaySquare,
  UsersRound,
  ShieldCheck,
  MessageCircle,
  CreditCard,
  ArrowUpRight,
  Loader2,
  Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const EMPTY_ARRAY = [];

const parseISO8601Duration = (durationStr) => {
  if (!durationStr) return { seconds: 0 };
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = durationStr.match(regex);
  if (!matches) return { seconds: 0 };
  const hours = parseInt(matches[1] || 0, 10);
  const minutes = parseInt(matches[2] || 0, 10);
  const seconds = parseInt(matches[3] || 0, 10);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return { seconds: totalSeconds };
};

const Header = ({
  toggleSidebar,
  onSearch,
  setActiveTab,
  notifications = EMPTY_ARRAY,
  channels = [],
  selectedChannelId,
  setSelectedChannelId,
  setVideoSubTab
}) => {
  const { user, logout, switchOrg } = useAuth();
  const [localNotifications, setLocalNotifications] = useState([]);

  useEffect(() => {
    if (!notifications) return;

    setLocalNotifications(prev => {
      // 1. Build a map of existing notifications' read status
      const readStatusMap = new Map();
      prev.forEach(n => {
        const id = n._id || n.id;
        if (id) {
          readStatusMap.set(id, n.isRead);
        }
      });

      // 2. Filter out duplicates from the new notifications
      const seenIds = new Set();
      const uniqueNewNotifications = [];

      notifications.forEach(n => {
        const id = n._id || n.id;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          // Preserve read status if it was already in our list, otherwise default to false
          const isRead = readStatusMap.has(id) ? readStatusMap.get(id) : false;
          uniqueNewNotifications.push({ ...n, isRead });
        }
      });

      return uniqueNewNotifications;
    });
  }, [notifications]);

  const unreadCount = localNotifications.filter(n => !n.isRead).length;

  const sortedNotifications = [...localNotifications].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.publishedAt || 0).getTime();
    const timeB = new Date(b.createdAt || b.publishedAt || 0).getTime();
    return timeB - timeA;
  });

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

  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState({ pages: [], channels: [], videos: [], leads: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const searchContainerRef = useRef(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: 'Dashboard', icon: LayoutDashboard },
    { id: 'videos', label: 'Video Library', path: 'Videos', icon: Video },
    { id: 'channels', label: 'Connected Channels', path: 'Channels', icon: PlaySquare },
    { id: 'leads', label: 'WhatsApp Leads', path: 'Leads', icon: UsersRound },
    { id: 'moderation', label: 'Auto-Mod', path: 'Auto-Mod', icon: ShieldCheck },

    { id: 'subscription', label: 'Subscription', path: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', path: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ pages: [], channels: [], videos: [], leads: [] });
      setSearchLoading(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      const query = searchQuery.toLowerCase().trim();

      // 1. Match Pages
      const matchedPages = menuItems.filter(item =>
        item.label.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query)
      );

      // 2. Match Channels
      const matchedChannels = (channels || []).filter(channel =>
        channel.title.toLowerCase().includes(query)
      );

      let matchedLeads = [];
      let matchedVideos = [];

      try {
        const leadsRes = await api.get(`/leads?search=${encodeURIComponent(query)}`);
        matchedLeads = Array.isArray(leadsRes.data) ? leadsRes.data.slice(0, 5) : [];
      } catch (err) {
        console.error('Search leads error:', err);
      }

      try {
        const activeChannelId = selectedChannelId || (channels && channels[0]?.channelId);
        if (activeChannelId) {
          const videosRes = await api.get(`/youtube/videos?channelId=${activeChannelId}`);
          const allVideos = videosRes.data?.videos || [];
          matchedVideos = allVideos
            .filter(v =>
              (v.title && v.title.toLowerCase().includes(query)) ||
              (v.description && v.description.toLowerCase().includes(query))
            )
            .slice(0, 5);
        }
      } catch (err) {
        console.error('Search videos error:', err);
      }

      setSearchResults({
        pages: matchedPages,
        channels: matchedChannels,
        leads: matchedLeads,
        videos: matchedVideos
      });
      setSearchLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, channels, selectedChannelId]);

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
          className="flex items-center cursor-pointer group select-none py-1"
        >
          <img src="/channelmate_logo.svg" className="h-10 sm:h-11 w-auto object-contain drop-shadow-sm transition-transform group-hover:scale-[1.02]" alt="Channelmate Logo" />
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
        <div className="relative w-full group" ref={searchContainerRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#909090] transition-colors group-focus-within:text-[#22c55e]" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            placeholder="Search activity, leads, or video audits..."
            className="w-full glass-input rounded-2xl py-2.5 pl-12 pr-6 text-[14px] font-medium outline-none transition-all placeholder-[#adb5bd]"
          />

          <AnimatePresence>
            {isFocused && (searchQuery.trim() !== '' || menuItems.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[200] overflow-hidden max-h-[480px] flex flex-col"
              >
                <div className="flex-1 overflow-y-auto no-scrollbar py-3 divide-y divide-slate-100">
                  {searchLoading && (
                    <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                      <Loader2 className="animate-spin text-[#22c55e]" size={16} />
                      <span className="text-[12px] font-black uppercase tracking-wider">Searching Hub...</span>
                    </div>
                  )}

                  {!searchLoading && searchQuery.trim() !== '' &&
                    searchResults.pages.length === 0 &&
                    searchResults.channels.length === 0 &&
                    searchResults.videos.length === 0 &&
                    searchResults.leads.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-2">
                          <Search size={20} />
                        </div>
                        <p className="text-[12px] font-bold text-slate-400">No results found for "{searchQuery}"</p>
                      </div>
                    )}

                  {!searchLoading && searchResults.pages.length > 0 && (
                    <div className="p-3">
                      <div className="px-3 pb-2 text-[9px] font-black text-[#909090] uppercase tracking-widest">
                        Navigation Pages
                      </div>
                      <div className="space-y-1">
                        {searchResults.pages.map(item => {
                          const IconComp = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id);
                                setIsFocused(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-500/5 rounded-xl transition-all text-left group"
                            >
                              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-[#606060] group-hover:bg-[#22c55e]/10 group-hover:text-[#22c55e] transition-colors shrink-0">
                                <IconComp size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-black text-slate-800 group-hover:text-[#22c55e] transition-colors truncate">
                                  {item.label}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 truncate">
                                  Go to {item.path}
                                </p>
                              </div>
                              <ArrowUpRight size={14} className="text-slate-355 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!searchLoading && searchResults.channels.length > 0 && (
                    <div className="p-3">
                      <div className="px-3 pb-2 text-[9px] font-black text-[#909090] uppercase tracking-widest">
                        Connected Channels
                      </div>
                      <div className="space-y-1">
                        {searchResults.channels.map(channel => (
                          <button
                            key={channel.channelId}
                            onClick={() => {
                              if (setSelectedChannelId) {
                                setSelectedChannelId(channel.channelId);
                              }
                              setActiveTab('dashboard');
                              setIsFocused(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-500/5 rounded-xl transition-all text-left group"
                          >
                            <img
                              src={channel.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=80'}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0"
                              alt=""
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-black text-slate-800 truncate">
                                {channel.title}
                              </p>
                              <p className="text-[10px] font-bold text-[#22c55e] flex items-center gap-1 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
                                Active Channel
                              </p>
                            </div>
                            <ArrowUpRight size={14} className="text-slate-355 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!searchLoading && searchResults.videos.length > 0 && (
                    <div className="p-3">
                      <div className="px-3 pb-2 text-[9px] font-black text-[#909090] uppercase tracking-widest">
                        Video Library
                      </div>
                      <div className="space-y-1">
                        {searchResults.videos.map(video => (
                          <button
                            key={video.videoId}
                            onClick={() => {
                              if (setSelectedChannelId) {
                                setSelectedChannelId(video.channelId);
                              }

                              let targetSubTab = 'videos';
                              if (video.isPost) {
                                targetSubTab = 'posts';
                              } else if (video.duration) {
                                const { seconds } = parseISO8601Duration(video.duration);
                                if (seconds < 60) {
                                  targetSubTab = 'shorts';
                                }
                              }
                              if (setVideoSubTab) {
                                setVideoSubTab(targetSubTab);
                              }

                              if (onSearch) {
                                onSearch(video.title);
                              }
                              setSearchQuery(video.title);
                              setActiveTab('videos');
                              setIsFocused(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-500/5 rounded-xl transition-all text-left group"
                          >
                            <img
                              src={video.thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120'}
                              className="w-10 h-7 rounded-lg object-cover border border-slate-100 shadow-sm shrink-0"
                              alt=""
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-black text-slate-800 truncate">
                                {video.title}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 truncate">
                                {video.isPost
                                  ? 'Community Post'
                                  : (video.duration && parseISO8601Duration(video.duration).seconds < 60 ? 'Short' : 'Video')
                                } • {video.statistics?.commentCount || 0} Comments
                              </p>
                            </div>
                            <ArrowUpRight size={14} className="text-slate-355 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!searchLoading && searchResults.leads.length > 0 && (
                    <div className="p-3">
                      <div className="px-3 pb-2 text-[9px] font-black text-[#909090] uppercase tracking-widest">
                        WhatsApp Leads
                      </div>
                      <div className="space-y-1">
                        {searchResults.leads.map(lead => (
                          <button
                            key={lead._id}
                            onClick={() => {
                              if (onSearch) {
                                onSearch(lead.authorName);
                              }
                              setSearchQuery(lead.authorName);
                              setActiveTab('leads');
                              setIsFocused(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-500/5 rounded-xl transition-all text-left group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {lead.authorName ? lead.authorName.charAt(0).toUpperCase() : 'L'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-black text-slate-800 truncate">
                                {lead.authorName}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 truncate">
                                WhatsApp: {lead.whatsappNumber} • Status: {lead.status}
                              </p>
                            </div>
                            <ArrowUpRight size={14} className="text-slate-355 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchQuery.trim() === '' && (
                    <div className="p-3">
                      <div className="px-3 pb-2 text-[9px] font-black text-[#909090] uppercase tracking-widest">
                        Quick Links
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {menuItems.map(item => {
                          const IconComp = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id);
                                setIsFocused(false);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-500/5 rounded-xl transition-all text-left group"
                            >
                              <div className="w-7 h-7 rounded-xl bg-slate-50 flex items-center justify-center text-[#606060] group-hover:bg-[#22c55e]/10 group-hover:text-[#22c55e] transition-colors shrink-0">
                                <IconComp size={14} />
                              </div>
                              <span className="text-[12px] font-black text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            {unreadCount > 0 && (
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
                  className="fixed right-0 top-0 h-[100vh] w-full max-w-[400px] bg-white z-[250] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col sm:absolute sm:right-0 sm:top-auto sm:h-auto sm:max-h-[480px] sm:w-[360px] sm:max-w-[360px] sm:mt-3 sm:rounded-[32px] sm:bg-white/70 sm:backdrop-blur-md sm:border sm:border-white/50 sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] sm:z-[200] overflow-hidden"
                >
                  {/* Sticky Header */}
                  <div className="p-5 border-b border-slate-100 sm:border-white/40 flex items-center justify-between bg-white sm:bg-white/40 sticky top-0 backdrop-blur-md z-10 pt-[calc(1.25rem+env(safe-area-inset-top))] sm:pt-5 shrink-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-[#0f0f0f] text-base tracking-tight">AI Insights</h3>
                      <span className="bg-green-50 text-[#22c55e] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{unreadCount} New</span>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-[#f8f8f8] text-[#909090] hover:text-[#0f0f0f] rounded-lg transition-colors sm:hidden"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto scroll-smooth no-scrollbar sm:max-h-[350px] pb-[calc(80px+env(safe-area-inset-bottom))] sm:pb-2">
                    {localNotifications.length === 0 ? (
                      <div className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-slate-50 sm:bg-white/40 rounded-2xl flex items-center justify-center text-[#cccccc] mb-3 border border-slate-100 sm:border-none">
                          <Bell size={24} />
                        </div>
                        <p className="text-[12px] font-bold text-[#909090]">No recent system alerts</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 p-2">
                        {sortedNotifications.map((notif, idx) => (
                          <motion.div
                            key={notif._id || notif.id || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                            className={`p-3 bg-slate-50/50 sm:bg-white/30 rounded-2xl hover:bg-slate-100/50 sm:hover:bg-white/60 transition-all cursor-pointer group flex gap-3 border border-transparent hover:border-slate-100 sm:hover:border-white/40 ${notif.isRead ? 'opacity-50' : ''}`}
                            onClick={() => {
                              if (notif.type === 'like' || notif.type === 'new_comment') setActiveTab('moderation');
                              else if (notif.whatsappSent) setActiveTab('leads');
                              setLocalNotifications(prev => prev.map(n => (n._id || n.id) === (notif._id || notif.id) ? { ...n, isRead: true } : n));
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
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-white sm:bg-white/40 border-t border-slate-100 sm:border-white/40 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 z-10 flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setLocalNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                      }}
                      disabled={unreadCount === 0}
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
            className="flex items-center gap-2.5 p-1.5 hover:bg-[#f8f8f8] rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0f0f0f] to-[#333] flex items-center justify-center text-white text-xs font-black shadow-md border border-white shrink-0 overflow-hidden">
              {user?.profilePicture ? (
                <img src={user.profilePicture} className="w-full h-full object-cover" alt="" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'A'
              )}
            </div>
            <div className="hidden lg:flex flex-col items-start pl-0.5 max-w-[140px]">
              <span className="text-[13px] font-black text-[#0f0f0f] truncate w-full text-left">{user?.name || 'Client'}</span>
              <span className="text-[9px] font-black text-[#2ba640] uppercase tracking-wider flex items-center gap-1 justify-start w-full">
                <div className="w-1.5 h-1.5 bg-[#2ba640] rounded-full animate-pulse" />
                {user?.organization || 'ONLINE'}
              </span>
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
                    <p className="text-sm font-black truncate">{user?.name || 'Client'} (Channel Owner)</p>
                    <span className="text-[9px] font-black text-green-400 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-[#2ba640] rounded-full animate-pulse" />
                      {user?.organization || 'ONLINE'}
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
                      <span className="text-[13px] font-black text-red-600">Logout</span>
                    </div>
                    <ChevronRight size={14} className="text-red-400" />
                  </button>
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
