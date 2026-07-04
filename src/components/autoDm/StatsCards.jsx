import React from 'react';
import { MessageSquare, Clock, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsCards = ({ stats, loading }) => {
  const formatTime = (timeStr) => {
    if (!timeStr) return 'Never';
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const cards = [
    {
      label: 'Total Replies Sent',
      value: stats?.totalReplies ?? 0,
      icon: MessageSquare,
      color: 'text-[#0f0f0f]',
      iconBg: 'bg-[#f8f9fa]',
      iconColor: 'text-[#0f0f0f]',
    },
    {
      label: 'Pending Comments',
      value: stats?.pendingComments ?? 0,
      icon: Zap,
      color: 'text-[#f9ab00]',
      iconBg: 'bg-[#fff8e1]',
      iconColor: 'text-[#f9ab00]',
    },
    {
      label: 'Last Run Time',
      value: formatTime(stats?.lastRunTime),
      icon: Clock,
      color: 'text-[#0f0f0f]',
      iconBg: 'bg-[#f8f9fa]',
      iconColor: 'text-[#065fd4]',
      isTime: true,
    },
    {
      label: 'Auto DM Status',
      value: stats?.status ?? 'Paused',
      icon: ShieldCheck,
      color: stats?.status === 'Active' ? 'text-[#2ba640]' : 'text-[#d93025]',
      iconBg: stats?.status === 'Active' ? 'bg-[#e6f4ea]' : 'bg-[#fce8e6]',
      iconColor: stats?.status === 'Active' ? 'text-[#2ba640]' : 'text-[#d93025]',
      isStatus: true,
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-[32px] border border-[#f0f0f0] p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden"
        >
          {/* Accent Glow */}
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${card.iconBg}`} />

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`w-10 h-10 rounded-[12px] ${card.iconBg} ${card.iconColor} flex items-center justify-center transition-transform group-hover:scale-115 duration-500`}>
              <card.icon size={20} strokeWidth={2.5} />
            </div>
            {card.isStatus && (
              <div className={`flex items-center gap-1.5 text-[9px] font-black tracking-wider uppercase py-1 px-2.5 rounded-full border ${stats?.status === 'Active' ? 'bg-green-50 text-[#2ba640] border-green-100' : 'bg-red-50 text-[#d93025] border-red-100'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${stats?.status === 'Active' ? 'bg-[#2ba640]' : 'bg-[#d93025]'} animate-pulse`} />
                {stats?.status ?? 'Paused'}
              </div>
            )}
          </div>

          <div className="space-y-1 relative z-10">
            {loading ? (
              <div className="h-8 bg-gray-100 rounded-lg w-24 animate-pulse"></div>
            ) : (
              <h3 className={`text-[22px] font-black ${card.color} tracking-tighter leading-none`}>
                {card.isTime ? card.value : (typeof card.value === 'number' ? card.value.toLocaleString() : card.value)}
              </h3>
            )}
            <p className="text-[9px] font-black text-[#909090] uppercase tracking-[0.2em]">{card.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
