import React from 'react';
import {
  MessageSquare,
  Smile,
  ShieldAlert,
  ThumbsUp,
  Trash2,
  AlertTriangle,
  Users,
  Send
} from 'lucide-react';

const StatCard = ({ card, isDark }) => {
  const Icon = card.icon;
  return (
    <div className={`min-w-0 rounded-[22px] border p-4 sm:p-5 shadow-sm transition-colors ${isDark ? 'bg-[#181818] border-[#2a2a2a]' : 'bg-white border-white/80'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl ${card.iconBg} ${card.iconColor}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${card.isUp ? 'bg-[#fff1f1] text-[#ff0000] border-red-100' : 'bg-red-50 text-[#d93025] border-red-100'}`}>
          {card.trend}
        </span>
      </div>
      <div className="mt-4 sm:mt-5">
        <p className={`text-2xl sm:text-4xl font-black leading-none tracking-tight ${isDark ? 'text-white' : card.color}`}>
          {card.value.toLocaleString()}
        </p>
        <p className={`mt-2 text-[11px] font-black uppercase tracking-[0.16em] ${isDark ? 'text-[#aaaaaa]' : 'text-[#606060]'}`}>{card.label}</p>
        <p className={`mt-2 sm:mt-3 text-[11px] sm:text-xs font-semibold leading-relaxed ${isDark ? 'text-[#888888]' : 'text-[#777777]'}`}>{card.description}</p>
      </div>
    </div>
  );
};

const StatsGrid = React.memo(({ stats, isDark = false }) => {
  const cards = [
    {
      label: 'Engagement',
      value: stats?.totalComments || 0,
      icon: MessageSquare,
      color: 'text-[#0f0f0f]',
      iconBg: 'bg-[#f8f9fa]',
      iconColor: 'text-[#0f0f0f]',
      trend: '+12%',
      isUp: true,
      description: 'All tracked comments and interactions in the selected window.'
    },
    {
      label: 'Positive',
      value: stats?.categories?.find(c => c._id === 'positive')?.count || 0,
      icon: Smile,
      color: 'text-[#2ba640]',
      iconBg: 'bg-[#e6f4ea]',
      iconColor: 'text-[#2ba640]',
      trend: '+5%',
      isUp: true,
      description: 'Healthy comments that can be liked or used for lead signals.'
    },
    {
      label: 'Toxic',
      value: stats?.categories?.find(c => c._id === 'toxic')?.count || 0,
      icon: ShieldAlert,
      color: 'text-[#d93025]',
      iconBg: 'bg-[#fce8e6]',
      iconColor: 'text-[#d93025]',
      trend: '-18%',
      isUp: false,
      description: 'Risky comments that need moderation or automated shielding.'
    },
    {
      label: 'Moderate',
      value: stats?.categories?.find(c => c._id === 'moderate')?.count || 0,
      icon: AlertTriangle,
      color: 'text-[#f9ab00]',
      iconBg: 'bg-[#fff8e1]',
      iconColor: 'text-[#f9ab00]',
      trend: '-2%',
      isUp: false,
      description: 'Comments worth reviewing before taking automatic action.'
    },
    {
      label: 'Auto Shield',
      value: stats?.toxicDeleted || 0,
      icon: Trash2,
      color: 'text-[#0f0f0f]',
      iconBg: 'bg-[#fff1f1]',
      iconColor: 'text-[#ff0000]',
      trend: '+8%',
      isUp: true,
      description: 'Comments handled by delete or hide protection rules.'
    },
    {
      label: 'Auto Likes',
      value: stats?.positiveLiked || 0,
      icon: ThumbsUp,
      color: 'text-[#0f0f0f]',
      iconBg: 'bg-[#f8f9fa]',
      iconColor: 'text-[#0f0f0f]',
      trend: '+24%',
      isUp: true,
      description: 'Positive comments automatically acknowledged.'
    },
    {
      label: 'Auto Reply',
      value: stats?.autoDm?.total || 0,
      icon: Send,
      color: 'text-[#0f0f0f]',
      iconBg: 'bg-[#fff1f1]',
      iconColor: 'text-[#ff0000]',
      trend: (stats?.autoDm?.changePercentage >= 0) ? `+${stats?.autoDm?.changePercentage}%` : `${stats?.autoDm?.changePercentage || 0}%`,
      isUp: (stats?.autoDm?.changePercentage || 0) >= 0,
      description: 'Automated replies sent through active comment rules.'
    },
    {
      label: 'Captured Leads',
      value: stats?.totalLeads || 0,
      icon: Users,
      color: 'text-[#0f0f0f]',
      iconBg: 'bg-[#0f0f0f]',
      iconColor: 'text-white',
      trend: '+42%',
      isUp: true,
      description: 'Comments converted into actionable lead records.'
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 min-[481px]:grid-cols-2 min-[1025px]:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} card={card} isDark={isDark} />
      ))}
    </div>
  );
});

export default StatsGrid;