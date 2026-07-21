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
  searchQuery,
  dateRange,
  setDateRange
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
          <h1 className="text-xl md:text-2xl font-black text-[#0f0f0f] tracking-tighter"> Dashboard</h1>

        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          <div className="flex flex-col min-[400px]:flex-row items-stretch min-[400px]:items-center justify-between md:justify-start gap-3 md:gap-2 w-full md:w-auto">
            <div className="relative flex items-center bg-white border border-[#e5e5e5] rounded-lg px-3 py-3 min-[400px]:py-2.5 md:py-1.5 shadow-sm w-full min-[400px]:w-[45%] md:w-auto min-h-[44px] md:min-h-0">
              <Clock size={14} className="text-[#909090] shrink-0 pointer-events-none" />
              <select
                value={dateRange?.label || 'Last 30 Days'}
                onChange={(e) => {
                  const label = e.target.value;
                  let days = 30;
                  if (label === 'Last 24 Hours') days = 1;
                  if (label === 'Last 7 Days') days = 7;
                  if (label === 'Last 30 Days') days = 30;
                  if (label === 'Last 90 Days') days = 90;
                  setDateRange({
                    startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
                    endDate: new Date().toISOString(),
                    label
                  });
                }}
                className="bg-transparent pl-2 pr-4 text-[14px] min-[400px]:text-[13px] md:text-[12px] font-bold text-[#0f0f0f] cursor-pointer outline-none appearance-none w-full"
              >
                <option value="Last 24 Hours">Last 24 Hours</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
              </select>
              <span className="text-[10px] pointer-events-none text-[#909090] ml-1">▼</span>
            </div>
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="yt-btn-primary !py-3 min-[400px]:!py-2.5 md:!py-1.5 !px-4 !text-sm md:!text-xs flex items-center justify-center gap-2 w-full min-[400px]:w-[55%] md:w-auto active:scale-95 transition-all min-h-[44px] md:min-h-0"
            >
              {loading ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
              Live Analysis
            </button>
          </div>
        </div>
      </div>



      {stats?.aiStatus === 'Unavailable' && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-semibold rounded-2xl flex items-center gap-3 shadow-sm mb-4">
          <AlertTriangle className="text-red-650 shrink-0" size={20} />
          <div>
            <p className="font-bold text-red-900">AI Service is currently unavailable</p>
            <p className="text-xs text-red-750 font-medium">DeepSeek API returned an Insufficient Balance error. Automation features will fallback to keyword rules until the balance is recharged.</p>
          </div>
        </div>
      )}

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
                  data={sentimentData.length > 0 ? sentimentData : [{ name: 'Empty', value: 1 }]}
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
            {stats?.languages && stats.languages.length > 0 ? (
              stats.languages.map((lang, i) => {
                const pct = Math.round((lang.count / (stats.totalComments || 1)) * 100);
                const colors = ['#22c55e', '#065fd4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
                return (
                  <div key={lang._id} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-[#606060] uppercase tracking-wider">{lang._id}</span>
                      <span className="text-[#0f0f0f]">{lang.count} comments ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="text-3xl">🌐</span>
                <p className="text-[11px] text-[#909090] italic text-center">Language data loads as new comments are processed by DeepSeek AI</p>
              </div>
            )}
          </div>
        </div>

        <div className="yt-card !p-5">
          <h3 className="text-base font-bold text-[#0f0f0f] mb-4">Top Word Categories</h3>
          <div className="flex flex-wrap gap-3">
            {stats?.topCategories && stats.topCategories.length > 0 ? (
              stats.topCategories.map((cat, i) => {
                const catColors = ['text-[#22c55e] bg-[#e6f4ea]', 'text-[#065fd4] bg-[#e8f0fe]', 'text-[#d93025] bg-[#fce8e6]', 'text-[#f59e0b] bg-[#fff8e1]', 'text-[#8b5cf6] bg-[#f3e8ff]', 'text-[#ec4899] bg-[#fce7f3]'];
                return (
                  <div key={cat._id} className={`flex flex-col items-center gap-1 border border-[#f0f0f0] p-4 rounded-2xl min-w-[90px] flex-1 ${catColors[i % catColors.length].split(' ')[1]}`}>
                    <span className={`text-[20px] font-black ${catColors[i % catColors.length].split(' ')[0]}`}>{cat.count}</span>
                    <span className="text-[10px] font-black text-[#909090] uppercase tracking-tighter text-center">{cat._id}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-[11px] text-[#909090] italic">Awaiting more comment data for categorization...</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
