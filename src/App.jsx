import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import api, { API_BASE_URL } from './services/api';
import { io } from 'socket.io-client';
import { 
  MessageSquare, 
  ShieldCheck, 
  BarChart3, 
  Loader2,
  AlertTriangle,
  PlaySquare,
  Zap,
  TrendingUp,
  Clock,
  ThumbsUp,
  Trash2,
  Activity,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Search
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, 
  ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { SENTIMENT_COLORS, SENTIMENT_ORDER, getSentimentConfig } from './utils/constants/sentimentColors';

// Import Pages (Lazy Loaded)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const VideosPage = lazy(() => import('./pages/VideosPage'));
const ChannelsPage = lazy(() => import('./pages/ChannelsPage'));
const ModerationPage = lazy(() => import('./pages/ModerationPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';

const App = () => {
  const { user, authLoading, logout } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('status') === 'success') {
      // Small alert to confirm success
      setTimeout(() => alert('✅ YouTube Channel Connected Successfully!'), 500);
      // Clean up the URL to avoid repeated alerts on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    return queryParams.get('redirect') === 'comments' ? 'videos' : 'dashboard';
  });
  const [isEmbedded] = useState(() => {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get('embed') === 'true';
  });
  const [stats, setStats] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
      fetchChannels();
      
      const socket = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        auth: {
          token: localStorage.getItem('token')
        }
      });

      console.log('🔌 Connecting to WebSocket...');
      
      socket.on('connect', () => {
        console.log('✅ WebSocket Connected');
      });
      
      socket.on('connect_error', (err) => {
        console.error('❌ WebSocket Connection Error:', err.message);
      });

      socket.on('live_activity', (activity) => {
        setActivities(prev => {
          if (prev.find(a => (a._id || a.id) === (activity._id || activity.id))) return prev;
          const updated = [activity, ...prev];
          return updated.slice(0, 10);
        });
      });

      socket.on('stats_updated', fetchAnalytics);
      socket.on('new_comment_analyzed', fetchAnalytics);
      
      return () => socket.disconnect();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const url = selectedChannelId ? `/analytics?channelId=${selectedChannelId}` : '/analytics';
      const res = await api.get(url);
      setStats(res.data);
      if (res.data.activities) setActivities(res.data.activities);
    } catch (err) {
      console.error('Fetch Analytics Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await api.get('/youtube/channels');
      setChannels(res.data);
      if (res.data.length > 0 && !selectedChannelId) {
        setSelectedChannelId(res.data[0].channelId);
      }
    } catch (err) {
      console.error('Fetch Channels Error:', err);
    }
  };

  useEffect(() => {
    if (user && !loading) fetchAnalytics();
  }, [selectedChannelId]);

  const disconnectChannel = async (id, name) => {
    if(!window.confirm(`Are you sure you want to disconnect ${name}? All related comments and data will be removed.`)) return;
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
      alert('Failed to disconnect channel.');
    } finally {
      setLoading(false);
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

  if (!user) {
    return isRegistering ? 
      <Register onSwitchToLogin={() => setIsRegistering(false)} /> : 
      <Login onSwitchToRegister={() => setIsRegistering(true)} />;
  }

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
        />;
      case 'channels':
        return <ChannelsPage 
          channels={channels} 
          onDisconnect={disconnectChannel}
          onAdd={() => window.location.href = `${API_BASE_URL}/auth`}
          setActiveTab={setActiveTab}
          setSelectedChannelId={setSelectedChannelId}
        />;
      case 'moderation':
        return <ModerationPage channels={channels} onAction={fetchAnalytics} searchQuery={searchQuery} />;
      case 'leads':
        return <LeadsPage searchQuery={searchQuery} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f9f9f9]">
      {!isEmbedded && (
        <Header 
          toggleSidebar={toggleSidebar} 
          onSearch={setSearchQuery} 
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
        />
      )}
      
      <div className="flex flex-1 overflow-hidden relative">
        {!isEmbedded && (
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogout={logout} 
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />
        )}
        
        <main className={`flex-1 ${isEmbedded ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 md:p-6 lg:p-8'} custom-scroll transition-all duration-300 ease-in-out`}>
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
                    <Loader2 className="animate-spin text-[#ff0000]" size={40} />
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
    </div>
  );
};

export default App;
