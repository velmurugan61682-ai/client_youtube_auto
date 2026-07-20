import React from 'react';
import {
  MessageSquare,
  Smile,
  ShieldAlert,
  ThumbsUp,
  TrendingUp,
  TrendingDown,
  Trash2,
  AlertTriangle,
  Users,
  Zap,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SENTIMENT_COLORS } from '../utils/constants/sentimentColors.js';

const StatsGrid = React.memo(({ stats }) => {
  const cards = [
    {
      label: 'Engagement',
      value: stats?.totalComments || 0,
      icon: MessageSquare,
      color: 'text-[#0f0f0f]',
      iconBg: 'bg-[#f8f9fa]',
      iconColor: 'text-[#0f0f0f]',
      trend: '+12%',
      isUp: true
    },
    {
      label: 'Positive',
      value: stats?.categories?.find(c => c._id === 'positive')?.count || 0,
      icon: Smile,
      color: 'text-[#2ba640]',
      iconBg: 'bg-[#e6f4ea]',
      iconColor: 'text-[#2ba640]',
      trend: '+5%',
      isUp: true
    },
    {
      label: 'Toxic',
      value: stats?.categories?.find(c => c._id === 'toxic')?.count || 0,
      icon: ShieldAlert,
      color: 'text-[#d93025]',
      iconBg: 'bg-[#fce8e6]',
      iconColor: 'text-[#d93025]',
      trend: '-18%',
      isUp: false
    },
    {
      label: 'Moderate',
      value: stats?.categories?.find(c => c._id === 'moderate')?.count || 0,
      icon: AlertTriangle,
      color: 'text-[#f9ab00]',
      iconBg: 'bg-[#fff8e1]',
      iconColor: 'text-[#f9ab00]',
      trend: '-2%',
      isUp: false
    },
    {
      label: 'Auto Shield',
      value: stats?.toxicDeleted || 0,
      icon: Trash2,
      color: 'text-[#0f0f0f]',
      iconBg: 'bg-[#f8f9fa]',
      iconColor: 'text-[#d93025]',
      trend: '+8%',
      isUp: true
    },
    {
      label: 'Auto Likes',
      value: stats?.positiveLiked || 0,
      icon: ThumbsUp,
      color: 'text-[#0f0f0f]',
      iconBg: 'bg-[#f8f9fa]',
      iconColor: 'text-[#065fd4]',
      trend: '+24%',
      isUp: true
    },
    {
      label: 'Auto reply',
      value: stats?.autoDm?.total || 0,
      icon: Send,
      color: 'text-[#0f0f0f]',
      iconBg: 'bg-[#f3e5f5]',
      iconColor: 'text-[#9c27b0]',
      trend: (stats?.autoDm?.changePercentage >= 0) ? `+${stats?.autoDm?.changePercentage}%` : `${stats?.autoDm?.changePercentage || 0}%`,
      isUp: (stats?.autoDm?.changePercentage || 0) >= 0
    },
    {
      label: 'Captured Leads',
      value: stats?.totalLeads || 0,
      icon: Users,
      color: 'text-[#0f0f0f]',
      iconBg: 'bg-[#0f0f0f]',
      iconColor: 'text-[#ffffff]',
      trend: '+42%',
      isUp: true
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden ${card.label === 'Engagement'
              ? 'sm:col-span-2 lg:col-span-1'
              : card.label === 'Captured Leads'
                ? 'sm:col-span-2 lg:col-span-2 xl:col-span-1'
                : ''
            }`}
        >
          {/* Subtle Accent Glow */}
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${card.iconBg}`} />

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className={`w-10 h-10 rounded-[12px] ${card.iconBg} ${card.iconColor} flex items-center justify-center transition-transform group-hover:scale-105 duration-500`}>
              <card.icon size={18} strokeWidth={2.5} />
            </div>
            <div className={`flex items-center gap-1 text-[9px] font-black tracking-wider uppercase py-1 px-2.5 rounded-full border ${card.isUp ? 'bg-green-50 text-[#22c55e] border-green-100' : 'bg-red-50 text-[#d93025] border-red-100'}`}>
              {card.trend}
            </div>
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className={`text-[26px] font-black ${card.color} tracking-tighter leading-none`}>
              {card.value.toLocaleString()}
            </h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{card.label}</p>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${card.isUp ? 'bg-[#22c55e]' : 'bg-[#d93025]'} animate-pulse`} />
              <span className="text-[9px] font-semibold text-slate-400">Real-time Track</span>
            </div>
            <motion.div
              whileHover={{ x: 2 }}
              className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100"
            >
              <TrendingUp size={12} className={card.isUp ? '' : 'rotate-180'} />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

export default StatsGrid;
