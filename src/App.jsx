import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import api from './services/api';
import { connectSocket, disconnectSocket } from './services/socket';
import {
  Loader2,
  WifiOff,
  LayoutDashboard,
  Video,
  MessageCircle,
  Settings,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Import Pages (Lazy Loaded)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const VideosPage = lazy(() => import('./pages/VideosPage'));
const ChannelsPage = lazy(() => import('./pages/ChannelsPage'));
const ModerationPage = lazy(() => import('./pages/ModerationPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const AutoSchedulePage = lazy(() => import('./pages/AutoSchedule'));
const AutoDmPage = lazy(() => import('./pages/AutoDm'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { Routes, Route, Navigate } from 'react-router-dom';

let activeAnalyticsPromise = null;
let activeChannelsPromise = null;

const App = () => {
  const { user, authLoading, logout } = useAuth();
  const [planSelected, setPlanSelected] = useState(() => sessionStorage.getItem('plan_acknowledged') === 'true');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('status') === 'success') {
      // Small alert to confirm success
      setTimeout(() => alert('✅ YouTube Channel Connected Successfully!'), 500);
      return 'channels';
    }
    return queryParams.get('redirect') === 'comments' ? 'videos' : 'dashboard';
  });
  const [isEmbedded] = useState(() => {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get('embed') === 'true';
  });
  const [stats, setStats] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(() => {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get('channelId') || localStorage.getItem('lastSelectedChannelId') || null;
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [videoSubTab, setVideoSubTab] = useState('videos');

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('status') === 'success') {
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (queryParams.get('status') === 'error') {
      const errMsg = queryParams.get('error') || 'Failed to connect account.';
      setTimeout(() => {

        if (errMsg.toLowerCase().includes('limit') || errMsg.toLowerCase().includes('free plan') || errMsg.toLowerCase().includes('pro')) {
          setActiveTab('subscription');
        }
      }, 500);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      Promise.resolve().then(() => {
        setSidebarOpen(false);
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (sidebarOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      if (window.confirm('🔄 A new version of the app is available. Click OK to reload and update.')) {
        window.location.reload();
      }
    };
    window.addEventListener('sw-update-available', handleUpdate);
    return () => window.removeEventListener('sw-update-available', handleUpdate);
  }, []);

  useEffect(() => {
    if (user) {
      // Free plan is permanent and lets users enter the app; they are restricted at channel-connection level.
      Promise.resolve().then(() => {
        setPlanSelected(true);
      });
    } else {
      Promise.resolve().then(() => {
        setPlanSelected(false);
        sessionStorage.removeItem('plan_acknowledged');
      });
    }
  }, [user]);

  const fetchAnalytics = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Waiting for login...');
      return;
    }
    const url = selectedChannelId ? `/analytics?channelId=${selectedChannelId}` : '/analytics';

    if (activeAnalyticsPromise && activeAnalyticsPromise.url === url) {
      return activeAnalyticsPromise.promise;
    }

    const promise = api.get(url)
      .then(res => {
        setStats(res.data);
        if (res.data.activities) setActivities(res.data.activities);
        return res.data;
      })
      .catch(err => {
        console.error('Fetch Analytics Error:', err);
      })
      .finally(() => {
        activeAnalyticsPromise = null;
        setLoading(false);
      });

    activeAnalyticsPromise = { url, promise };
    return promise;
  }, [selectedChannelId]);

  const fetchChannels = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Waiting for login...');
      return;
    }

    if (activeChannelsPromise) {
      return activeChannelsPromise;
    }

    activeChannelsPromise = api.get('/youtube/channels')
      .then(res => {
        setChannels(res.data);

        // Auto-bypass plan gate if they already have 1 or more channels connected
        if (res.data.length >= 1) {
          setPlanSelected(true);
          sessionStorage.setItem('plan_acknowledged', 'true');
        }

        const channelExists = res.data.some(c => c.channelId === selectedChannelId);
        if (!channelExists) {
          setSelectedChannelId(res.data.length > 0 ? res.data[0].channelId : null);
        }
        return res.data;
      })
      .catch(err => {
        console.error('Fetch Channels Error:', err);
      })
      .finally(() => {
        activeChannelsPromise = null;
        setLoadingChannels(false);
      });

    return activeChannelsPromise;
  }, [selectedChannelId]);

  // 1. Fetch channels on startup to verify connected accounts & gate bypass
  useEffect(() => {
    if (user) {
      fetchChannels();
    }
  }, [user, fetchChannels]);

  // 2a. Manage Socket.IO connection state based on login/plan status
  useEffect(() => {
    if (user && planSelected) {
      connectSocket(localStorage.getItem('token'));
    } else if (!user) {
      disconnectSocket();
    }
  }, [user, planSelected]);

  // 2b. Register/unregister live Socket.IO event listeners
  useEffect(() => {
    if (user && planSelected) {
      const socket = connectSocket(localStorage.getItem('token'));

      const handleLiveActivity = (activity) => {
        setActivities(prev => {
          if (prev.find(a => (a._id || a.id) === (activity._id || activity.id))) return prev;
          const updated = [activity, ...prev];
          return updated.slice(0, 10);
        });
      };

      socket.on('live_activity', handleLiveActivity);
      socket.on('stats_updated', fetchAnalytics);
      socket.on('new_comment_analyzed', fetchAnalytics);

      return () => {
        socket.off('live_activity', handleLiveActivity);
        socket.off('stats_updated', fetchAnalytics);
        socket.off('new_comment_analyzed', fetchAnalytics);
      };
    }
  }, [user, planSelected, fetchAnalytics]);

  useEffect(() => {
    if (selectedChannelId) {
      localStorage.setItem('lastSelectedChannelId', selectedChannelId);
    }
    if (user && planSelected) {
      fetchAnalytics();
    }
  }, [selectedChannelId, user, planSelected, fetchAnalytics]);

  const disconnectChannel = async (id, name) => {
    if (!window.confirm(`Are you sure you want to disconnect ${name}? All related comments and data will be removed.`)) return;
    try {
      setLoading(true);
      await api.delete(`/youtube/channels/${id}`);
      setChannels(prev => prev.filter(c => c.channelId !== id));
      if (selectedChannelId === id) {
        setSelectedChannelId(null);
        setActiveTab('channels');
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to disconnect channel:', err);
      alert('Failed to disconnect channel.');
    } finally {
      setLoading(false);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage
          stats={stats}
          channels={channels}
          selectedChannelId={selectedChannelId}
          setSelectedChannelId={setSelectedChannelId}
          fetchAnalytics={fetchAnalytics}
          loading={loading}
          activities={activities}
          searchQuery={searchQuery}
        />;
      case 'videos':
        return <VideosPage
          channels={channels}
          user={user}
          selectedChannelId={selectedChannelId}
          setSelectedChannelId={setSelectedChannelId}
          fetchAnalytics={fetchAnalytics}
          searchQuery={searchQuery}
          videoSubTab={videoSubTab}
          setVideoSubTab={setVideoSubTab}
        />;
      case 'channels':
        return <ChannelsPage
          channels={channels}
          onDisconnect={disconnectChannel}
          onAdd={async () => {
            try {
              const [subRes, channelsRes] = await Promise.all([
                api.get('/subscription/status'),
                api.get('/youtube/channels')
              ]);
              const currentSub = subRes.data.subscription;
              const userRole = subRes.data.role;
              const currentChannelsCount = channelsRes.data.length;

              const isSubActive = currentSub && currentSub.status === 'active';
              const isAdmin = userRole === 'admin';

              if (!isAdmin && !isSubActive && currentChannelsCount >= 1) {

                setActiveTab('subscription');
                return;
              }

              const res = await api.post('/youtube/auth/initiate');
              if (res.data.redirectUrl) {
                window.location.href = res.data.redirectUrl;
              }
            } catch (err) {
              const errMsg = err.response?.data?.error || 'Failed to initiate secure connection';
              alert(`❌ ${errMsg}`);
              if (err.response?.status === 403) {
                setActiveTab('subscription'); // Redirect to subscription plans to upgrade
              }
            }
          }}
          setActiveTab={setActiveTab}
          setSelectedChannelId={setSelectedChannelId}
        />;
      case 'moderation':
        return <ModerationPage channels={channels} onAction={fetchAnalytics} searchQuery={searchQuery} />;
      case 'leads':
        return <LeadsPage searchQuery={searchQuery} />;
      case 'autoschedule':
        return <AutoSchedulePage
          channels={channels}
          selectedChannelId={selectedChannelId}
          setSelectedChannelId={setSelectedChannelId}
        />;
      case 'autodm':
        return <AutoDmPage
          channels={channels}
          selectedChannelId={selectedChannelId}
          setSelectedChannelId={setSelectedChannelId}
        />;
      case 'settings':
        return <SettingsPage />;
      case 'subscription':
        return <SubscriptionPage isGate={false} />;
      default:
        return null;
    }
  };

  if (authLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f9f9f9]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#ff0000]" size={48} />
        <p className="text-[14px] font-bold text-[#606060] uppercase tracking-widest">Initialising Studio...</p>
      </div>
    </div>
  );

  return (
    <>
      <Suspense fallback={
        <div className="h-screen w-full flex items-center justify-center bg-[#f9f9f9]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#ff0000]" size={48} />
            <p className="text-[14px] font-bold text-[#606060] uppercase tracking-widest">Initialising Studio...</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
          <Route path="/dashboard" element={
            !user ? <Navigate to="/login" replace /> : (
              !planSelected && loadingChannels ? (
                <div className="h-screen w-full flex items-center justify-center bg-[#f9f9f9]">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[#ff0000]" size={48} />
                    <p className="text-[14px] font-bold text-[#606060] uppercase tracking-widest">Initialising Studio...</p>
                  </div>
                </div>
              ) : !planSelected ? (
                <div className="h-screen w-full overflow-y-auto bg-[#f9f9f9] py-12 px-4 md:px-8 flex items-center justify-center">
                  <Suspense fallback={
                    <div className="h-full w-full flex items-center justify-center">
                      <Loader2 className="animate-spin text-[#ff0000]" size={40} />
                    </div>
                  }>
                    <SubscriptionPage
                      isGate={true}
                      onSelectPlan={() => {
                        sessionStorage.setItem('plan_acknowledged', 'true');
                        setPlanSelected(true);
                        setActiveTab('dashboard');
                      }}
                    />
                  </Suspense>
                </div>
              ) : (
                <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden bg-[#f8fafc] relative selection:bg-green-500/20 selection:text-green-900 min-w-0 overflow-x-hidden">
                  {/* Dummy inputs for Chrome Password Manager / Autofill Trap */}
                  <div style={{ position: 'absolute', top: '-1000px', left: '-1000px', width: '0px', height: '0px', overflow: 'hidden' }} aria-hidden="true">
                    <input type="text" name="chrome_autocomplete_trap_email" tabIndex="-1" autoComplete="username" />
                    <input type="password" name="chrome_autocomplete_trap_password" tabIndex="-1" autoComplete="current-password" />
                  </div>
                  {!isEmbedded && (
                    <Header
                      toggleSidebar={toggleSidebar}
                      onSearch={setSearchQuery}
                      setActiveTab={setActiveTab}
                      sidebarOpen={sidebarOpen}
                      channels={channels}
                      selectedChannelId={selectedChannelId}
                      setSelectedChannelId={setSelectedChannelId}
                      setVideoSubTab={setVideoSubTab}
                      notifications={activities}
                    />
                  )}

                  <div className="flex flex-1 lg:overflow-hidden relative min-w-0 overflow-x-hidden">
                    {!isEmbedded && (
                      <Sidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onLogout={logout}
                        isOpen={sidebarOpen}
                        setIsOpen={setSidebarOpen}
                      />
                    )}

                    <main className={`flex-1 overflow-y-auto overflow-x-hidden min-w-0 ${isEmbedded ? 'p-0' : 'p-4 md:p-6 lg:p-8 pb-[calc(140px+env(safe-area-inset-bottom))] md:pb-6 lg:pb-8'} custom-scroll transition-all duration-300 ease-in-out`}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="h-full"
                        >
                          <Suspense fallback={
                            <div className="h-full w-full flex items-center justify-center">
                              <div className="flex flex-col items-center gap-4">
                                <Loader2 className="animate-spin text-[#22c55e]" size={40} />
                                <p className="text-[12px] font-bold text-[#909090] uppercase tracking-widest">Loading Module...</p>
                              </div>
                            </div>
                          }>
                            {renderActiveTab()}
                          </Suspense>
                        </motion.div>
                      </AnimatePresence>
                    </main>
                  </div>

                  {/* Mobile Bottom Navigation */}
                  {!isEmbedded && (
                    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-t border-slate-100 flex items-center justify-around px-4 z-40 pb-safe shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                      >
                        <div className="mobile-nav-icon-container">
                          <LayoutDashboard size={18} />
                        </div>
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('videos')}
                        className={`mobile-nav-item ${activeTab === 'videos' ? 'active' : ''}`}
                      >
                        <div className="mobile-nav-icon-container">
                          <Video size={18} />
                        </div>
                        <span>Videos</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('autodm')}
                        className={`mobile-nav-item ${activeTab === 'autodm' ? 'active' : ''}`}
                      >
                        <div className="mobile-nav-icon-container">
                          <MessageCircle size={18} />
                        </div>
                        <span>Auto DM</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className={`mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                      >
                        <div className="mobile-nav-icon-container">
                          <Settings size={18} />
                        </div>
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => setProfileSheetOpen(true)}
                        className="mobile-nav-item"
                      >
                        <div className="mobile-nav-icon-container">
                          <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                        </div>
                        <span>Profile</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            )
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Profile Bottom Sheet */}
      <AnimatePresence>
        {profileSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileSheetOpen(false)}
              className="bottom-sheet-overlay"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bottom-sheet-content"
            >
              <div className="bottom-sheet-handle" />
              <h3 className="text-lg font-black text-slate-900 mb-4">User Profile</h3>

              <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[11px] text-slate-500 truncate font-semibold">{user?.email}</p>
                </div>
                <span className="bg-green-500/10 text-green-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {user?.role === 'admin' ? 'Admin' : 'Pro'}
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => { setActiveTab('settings'); setProfileSheetOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 transition-all text-left"
                >
                  <Settings size={18} /> Settings & Billing
                </button>
                <button
                  onClick={() => { logout(); setProfileSheetOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 text-red-600 rounded-xl text-sm font-bold transition-all text-left border border-transparent hover:border-red-100/50"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 bg-[#d93025] text-white rounded-2xl shadow-2xl font-black text-xs uppercase tracking-wider border border-white/20 backdrop-blur-md"
          >
            <WifiOff size={16} />
            <span>You are currently offline</span>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default App;
