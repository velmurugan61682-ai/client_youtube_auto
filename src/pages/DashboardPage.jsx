import React from 'react';
import { 
  PieChart, Pie, Cell, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Clock, 
  ShieldCheck, 
  Activity, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import StatsGrid from '../components/StatsGrid';
import { SENTIMENT_COLORS, SENTIMENT_ORDER } from '../utils/constants/sentimentColors';

const DashboardPage = ({ 
  stats, 
  channels, 
  selectedChannelId, 
  setSelectedChannelId, 
  fetchAnalytics, 
  loading,
  activities,
  searchQuery
}) => {
  const sentimentData = SENTIMENT_ORDER.map(sentimentKey => {
    const cat = stats?.categories?.find(c => c._id === sentimentKey);
    const config = SENTIMENT_COLORS[sentimentKey];
    return {
      name: config.label,
      key: sentimentKey,
      value: cat?.count || 0,
      color: config.color
    };
  }).filter(data => data.value > 0);

  const filteredActivities = activities.filter(a => 
    a.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-[1440px] mx-auto space-y-6 md:space-y-8"
    >
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#0f0f0f] tracking-tighter">Channel Dashboard</h1>
          <p className="text-[12px] md:text-[13px] text-[#606060] font-medium">Monitoring emotional engagement across your content.</p>
        </div>
        <div className="flex items-center gap-2">
          {channels.length > 1 && (
            <select 
              value={selectedChannelId || ''} 
              onChange={(e) => setSelectedChannelId(e.target.value)}
              className="bg-white border border-[#e5e5e5] rounded-lg px-2 py-1.5 text-xs font-bold text-[#0f0f0f] shadow-sm outline-none cursor-pointer"
            >
              <option value="">All Channels</option>
              {channels.map(c => <option key={c.channelId} value={c.channelId}>{c.title}</option>)}
            </select>
          )}
          <div className="bg-white border border-[#e5e5e5] rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <Clock size={14} className="text-[#909090]" />
            <span className="text-[12px] font-bold text-[#0f0f0f]">Last 30 Days</span>
          </div>
          <button 
            onClick={fetchAnalytics}
            disabled={loading}
            className="yt-btn-primary !py-1.5 !px-4 !text-xs flex items-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
            Live Analysis
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Distribution */}
        <div className="yt-card lg:col-span-2 !p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#0f0f0f]">Sentiment Distribution</h3>
              <p className="text-[11px] text-[#909090] font-medium">Emotional engagement overview</p>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {sentimentData.map((entry) => (
                <div key={entry.key} className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-[#f9f9f9] rounded-md border border-[#f0f0f0]">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-[9px] font-bold text-[#606060] uppercase">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="h-[300px] min-h-[300px] relative w-full flex items-center justify-center">
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData.length > 0 ? sentimentData : [{name: 'Empty', value: 1}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={8}
                  cornerRadius={6}
                  dataKey="value"
                  animationDuration={1200}
                  stroke="none"
                >
                  {sentimentData.map((entry) => (
                    <Cell key={`cell-${entry.key}`} fill={entry.color} />
                  ))}
                  {sentimentData.length === 0 && <Cell fill="#f2f2f2" />}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)', padding: '12px 16px'
                  }}
                  itemStyle={{ fontWeight: '800', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-[#0f0f0f] tracking-tighter leading-none">{stats?.totalComments || 0}</span>
              <span className="text-[10px] font-bold text-[#909090] uppercase tracking-widest mt-1.5">Comments</span>
            </div>
          </div>
        </div>

        {/* Live Moderation Feed */}
        <div className="yt-card !p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[#2ba640]" size={18} />
              <h3 className="text-base font-bold text-[#0f0f0f]">Live Feed</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#ff0000] animate-pulse"></div>
              <span className="text-[10px] font-black text-[#ff0000] uppercase tracking-tighter">Live</span>
            </div>
          </div>
          
          <div className="space-y-3 min-h-[200px] max-h-[300px] overflow-y-auto no-scrollbar">
            {filteredActivities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8">
                <Activity size={32} className="mb-2" />
                <p className="text-[11px] font-bold">No matching activities...</p>
              </div>
            ) : (
              filteredActivities.map((activity, index) => (
                <div 
                  key={activity._id || activity.id || index}
                  className="p-3 bg-[#f8f8f8] border border-[#f0f0f0] rounded-xl"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase text-[#606060]">
                      {activity.type === 'delete' ? 'Auto-Deleted' : 
                       activity.type === 'like' ? 'Auto-Liked' : 'Analyzed'}
                    </span>
                    <span className="text-[9px] font-bold text-[#606060] bg-white px-2 py-0.5 rounded-full border border-[#f0f0f0]">
                      {Math.round((activity.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#606060] line-clamp-1 italic">"{activity.text}"</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 p-4 bg-[#fff8e1] border border-[#ffe082] rounded-xl flex items-start gap-3">
            <div className="bg-[#f9ab00] p-1.5 rounded-lg text-white flex-shrink-0">
              <AlertTriangle size={14} />
            </div>
            <p className="text-[10px] font-medium text-[#795548] leading-tight">
              <b>AI Status:</b> Monitoring English & Tanglish. {stats?.pendingModeration || 0} flagged for review.
            </p>
          </div>
        </div>
      </div>

      {/* Language breakdown and word categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="yt-card !p-5">
          <h3 className="text-base font-bold text-[#0f0f0f] mb-4">Language Breakdown</h3>
          <div className="space-y-4">
            {stats?.languages?.map((lang) => (
              <div key={lang._id} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-[#606060] uppercase tracking-wider">{lang._id}</span>
                  <span className="text-[#0f0f0f]">{lang.count} comments</span>
                </div>
                <div className="h-1.5 w-full bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ff0000]" 
                    style={{ width: `${(lang.count / (stats.totalComments || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="yt-card !p-5">
          <h3 className="text-base font-bold text-[#0f0f0f] mb-4">Top Word Categories</h3>
          <div className="flex flex-wrap gap-3">
            {stats?.topCategories?.map((cat) => (
              <div key={cat._id} className="flex flex-col items-center gap-1 bg-[#f9f9f9] border border-[#f0f0f0] p-4 rounded-2xl min-w-[100px] flex-1">
                <span className="text-[20px] font-black text-[#ff0000]">{cat.count}</span>
                <span className="text-[10px] font-black text-[#909090] uppercase tracking-tighter">{cat._id}</span>
              </div>
            ))}
            {(!stats?.topCategories || stats.topCategories.length === 0) && (
              <p className="text-[11px] text-[#909090] italic">Awaiting more comment data for categorization...</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
