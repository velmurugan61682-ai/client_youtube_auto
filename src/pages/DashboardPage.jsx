import React, { useState } from 'react';
import {
  PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip
} from 'recharts';
import { motion } from 'framer-motion';
import {
  Bell,
  Clock,
  ShieldCheck,
  Activity,
  AlertTriangle
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
  setDateRange,
  isDark = false
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const panelClass = isDark ? 'bg-[#181818] border-[#2a2a2a]' : 'bg-white border-white/80';
  const softClass = isDark ? 'bg-[#202020] border-[#2a2a2a]' : 'bg-[#f7f7f7] border-[#ededed]';
  const textClass = isDark ? 'text-white' : 'text-[#0f0f0f]';
  const mutedClass = isDark ? 'text-[#aaaaaa]' : 'text-[#606060]';

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
    (a.text || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    a.author?.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`min-h-[calc(100vh-2.5rem)] lg:h-[calc(100vh-2.5rem)] lg:min-h-[760px] overflow-visible lg:overflow-hidden rounded-[22px] sm:rounded-[28px] p-3 sm:p-5 transition-colors ${isDark ? 'bg-[#0f0f0f] text-white' : 'bg-[#eef3f5] text-[#0f0f0f]'}`}
    >
      <div className={`${panelClass} rounded-[22px] border shadow-sm p-4 sm:p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between`}>
        <h1 className={`text-[26px] sm:text-3xl font-black tracking-tight ${textClass}`}>Dashboard</h1>

        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
          {channels.length > 1 && (
            <select
              value={selectedChannelId || ''}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              className={`${softClass} rounded-full border px-4 py-3 text-xs font-black ${textClass} shadow-sm outline-none cursor-pointer`}
            >
              <option value="">All Channels</option>
              {channels.map(c => <option key={c.channelId} value={c.channelId}>{c.title}</option>)}
            </select>
          )}

          <div className="flex flex-col min-[400px]:flex-row items-stretch min-[400px]:items-center justify-between md:justify-start gap-3 md:gap-2 w-full md:w-auto">
            <div className={`${softClass} relative flex items-center rounded-full border px-4 h-11 shadow-sm w-full min-[400px]:w-auto min-[400px]:min-w-[155px] md:w-auto`}>
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
                className={`bg-transparent pl-2 pr-4 h-full text-[14px] min-[400px]:text-[13px] md:text-[12px] font-bold cursor-pointer outline-none appearance-none w-full ${textClass}`}
              >
                <option value="Last 24 Hours">Last 24 Hours</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
              </select>
            </div>

            <div className="relative w-full min-[400px]:w-auto md:w-auto">
              <button
                type="button"
                onClick={() => setShowNotifications(prev => !prev)}
                className="bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-full px-5 h-11 text-xs font-black shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 w-full min-[400px]:w-auto active:scale-95 transition-all"
              >
                <Bell size={14} />
                Notification
              </button>
              {showNotifications && (
                <div className={`absolute right-0 top-full z-50 mt-3 w-[min(340px,calc(100vw-2rem))] rounded-2xl border p-4 shadow-2xl ${isDark ? 'bg-[#181818] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'}`}>
                  <div className="flex items-center justify-between border-b border-current/10 pb-3">
                    <p className={`text-sm font-black ${textClass}`}>Live Notifications</p>
                    <button type="button" onClick={fetchAnalytics} disabled={loading} className="rounded-full bg-[#fff1f1] px-3 py-1 text-[10px] font-black text-[#ff0000] disabled:opacity-60">
                      {loading ? 'Syncing' : 'Refresh'}
                    </button>
                  </div>
                  <div className="max-h-[260px] overflow-y-auto pt-3 custom-scroll space-y-2">
                    {filteredActivities.length === 0 ? (
                      <div className={`${softClass} rounded-xl border p-4 text-center text-xs font-semibold ${mutedClass}`}>No live notifications yet.</div>
                    ) : filteredActivities.slice(0, 6).map((activity, index) => (
                      <div key={activity._id || activity.id || index} className={`${softClass} rounded-xl border p-3`}>
                        <p className={`text-[11px] font-black uppercase ${textClass}`}>{activity.type === 'delete' ? 'Auto deleted' : activity.type === 'like' ? 'Auto liked' : 'Analyzed'}</p>
                        <p className={`mt-1 line-clamp-2 text-xs font-semibold ${mutedClass}`}>{activity.text || 'New activity received.'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {stats?.aiStatus === 'Unavailable' && (
        <div className="mt-4 p-4 bg-[#fff1f1] border border-red-100 text-[#cc0000] text-sm font-semibold rounded-2xl flex items-center gap-3 shadow-sm">
          <AlertTriangle className="shrink-0" size={20} />
          <div>
            <p className="font-bold">AI Service is currently unavailable</p>
            <p className="text-xs font-medium">Automation features will fallback to keyword rules until the balance is recharged.</p>
          </div>
        </div>
      )}

      <div className="custom-scroll mt-4 min-h-0 lg:h-[calc(100%-92px)] overflow-visible lg:overflow-y-auto pr-0 lg:pr-1 space-y-4">
        <StatsGrid stats={stats} isDark={isDark} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className={`${panelClass} rounded-[22px] border shadow-sm lg:col-span-2 p-5 sm:p-6`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h3 className={`text-lg font-black ${textClass}`}>Sentiment Distribution</h3>
                <p className={`text-xs font-semibold ${mutedClass}`}>Emotional engagement overview</p>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {sentimentData.map((entry) => (
                  <div key={entry.key} className={`${softClass} flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full border`}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className={`text-[9px] font-bold uppercase ${mutedClass}`}>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[320px] min-h-[320px] relative w-full flex items-center justify-center">
              <ResponsiveContainer width="99%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData.length > 0 ? sentimentData : [{ name: 'Empty', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={typeof window !== 'undefined' && window.innerWidth < 480 ? 58 : 75}
                    outerRadius={typeof window !== 'undefined' && window.innerWidth < 480 ? 82 : 100}
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
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', padding: '12px 16px' }}
                    itemStyle={{ fontWeight: '800', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-4xl font-black ${textClass} tracking-tighter leading-none`}>{stats?.totalComments || 0}</span>
                <span className="text-[10px] font-bold text-[#909090] uppercase tracking-widest mt-1.5">Comments</span>
              </div>
            </div>
          </div>

          <div className={`${panelClass} rounded-[22px] border shadow-sm p-5 sm:p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-[#ff0000]" size={18} />
                <h3 className={`text-lg font-black ${textClass}`}>Live Feed</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ff0000] animate-pulse" />
                <span className="text-[10px] font-black text-[#ff0000] uppercase tracking-tighter">Live</span>
              </div>
            </div>

            <div className="space-y-3 min-h-[220px] max-h-[320px] overflow-y-auto custom-scroll pr-1">
              {filteredActivities.length === 0 ? (
                <div className={`h-full flex flex-col items-center justify-center text-center py-8 ${mutedClass}`}>
                  <Activity size={32} className="mb-2 opacity-40" />
                  <p className="text-[11px] font-bold">No matching activities...</p>
                </div>
              ) : filteredActivities.map((activity, index) => (
                <div key={activity._id || activity.id || index} className={`${softClass} p-3 border rounded-2xl`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-black uppercase ${mutedClass}`}>{activity.type === 'delete' ? 'Auto-Deleted' : activity.type === 'like' ? 'Auto-Liked' : 'Analyzed'}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${isDark ? 'bg-[#181818] border-[#2a2a2a] text-[#aaaaaa]' : 'bg-white border-[#f0f0f0] text-[#606060]'}`}>{Math.round((activity.confidence || 0) * 100)}%</span>
                  </div>
                  <p className={`text-[11px] line-clamp-1 italic ${mutedClass}`}>"{activity.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className={`${panelClass} rounded-[22px] border shadow-sm p-5 sm:p-6`}>
            <h3 className={`text-lg font-black ${textClass} mb-4`}>Language Breakdown</h3>
            <div className="space-y-4">
              {stats?.languages && stats.languages.length > 0 ? stats.languages.map((lang, i) => {
                const pct = Math.round((lang.count / (stats.totalComments || 1)) * 100);
                const colors = ['#ff0000', '#0f0f0f', '#606060', '#d93025', '#909090', '#cc0000', '#3f3f46', '#f59e0b'];
                return (
                  <div key={lang._id} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className={`${mutedClass} uppercase tracking-wider`}>{lang._id}</span>
                      <span className={textClass}>{lang.count} comments ({pct}%)</span>
                    </div>
                    <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-[#202020]' : 'bg-[#f0f0f0]'}`}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }} />
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <p className="text-[11px] text-[#909090] italic text-center">Language data loads as new comments are processed by DeepSeek AI</p>
                </div>
              )}
            </div>
          </div>

          <div className={`${panelClass} rounded-[22px] border shadow-sm p-5 sm:p-6`}>
            <h3 className={`text-lg font-black ${textClass} mb-4`}>Top Word Categories</h3>
            <div className="flex flex-wrap gap-3">
              {stats?.topCategories && stats.topCategories.length > 0 ? stats.topCategories.map((cat) => (
                <div key={cat._id} className={`${softClass} flex flex-col items-center gap-1 border p-4 rounded-2xl min-w-[90px] flex-1`}>
                  <span className="text-[20px] font-black text-[#ff0000]">{cat.count}</span>
                  <span className={`text-[10px] font-black uppercase tracking-tighter text-center ${mutedClass}`}>{cat._id}</span>
                </div>
              )) : (
                <p className="text-[11px] text-[#909090] italic">Awaiting more comment data for categorization...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;