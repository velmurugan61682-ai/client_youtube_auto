import React from 'react';
import { MessageSquare, Clock, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsCards = ({ stats, loading }) => {
  const formatTime = (timeStr) => {
    if (!timeStr) return 'Never';
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return 'Never';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const cards = [
    {
      label: 'Replies Sent',
      value: stats?.totalReplies ?? 0,
      icon: MessageSquare,
      color: 'text-slate-900',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-[#22c55e]',
    },
    {
      label: 'Pending Comments',
      value: stats?.pendingComments ?? 0,
      icon: Zap,
      color: 'text-amber-500',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Last Run Time',
      value: formatTime(stats?.lastRunTime),
      icon: Clock,
      color: 'text-slate-900',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      isTime: true,
    },
    {
      label: 'Auto DM Status',
      value: stats?.status ?? 'Paused',
      icon: ShieldCheck,
      color: stats?.status === 'Active' ? 'text-[#22c55e]' : 'text-red-500',
      iconBg: stats?.status === 'Active' ? 'bg-green-500/10' : 'bg-red-500/10',
      iconColor: stats?.status === 'Active' ? 'text-[#22c55e]' : 'text-red-500',
      isStatus: true,
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-[20px] border border-slate-100 p-4 md:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden"
        >
          {/* Accent Glow */}
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${card.iconBg}`} />

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-[10px] md:rounded-[12px] ${card.iconBg} ${card.iconColor} flex items-center justify-center transition-transform group-hover:scale-105 duration-500`}>
              <card.icon size={16} md:size={18} strokeWidth={2.5} />
            </div>
            {card.isStatus && (
              <div className={`hidden sm:flex items-center gap-1.5 text-[9px] font-black tracking-wider uppercase py-1 px-2.5 rounded-full border ${stats?.status === 'Active' ? 'bg-green-50 text-[#22c55e] border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${stats?.status === 'Active' ? 'bg-[#22c55e]' : 'bg-red-500'} animate-pulse`} />
                {stats?.status ?? 'Paused'}
              </div>
            )}
          </div>

          <div className="space-y-1 relative z-10">
            {loading ? (
              <div className="h-6 bg-slate-50 rounded-lg w-20 animate-pulse"></div>
            ) : (
              <h3 className={`text-[16px] sm:text-[20px] font-black ${card.color} tracking-tighter leading-none`}>
                {card.isTime ? card.value : (typeof card.value === 'number' ? card.value.toLocaleString() : card.value)}
              </h3>
            )}
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{card.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
