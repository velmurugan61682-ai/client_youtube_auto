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
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SENTIMENT_COLORS } from '../utils/constants/sentimentColors.js';

const StatsGrid = ({ stats }) => {
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
          className="bg-white rounded-[32px] border border-[#f0f0f0] p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${card.iconBg}`} />

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className={`w-12 h-12 rounded-[14px] ${card.iconBg} ${card.iconColor} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
              <card.icon size={22} strokeWidth={2.5} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black tracking-widest uppercase py-1 px-2.5 rounded-full border ${card.isUp ? 'bg-green-50 text-[#2ba640] border-green-100' : 'bg-red-50 text-[#d93025] border-red-100'}`}>
               {card.trend}
            </div>
          </div>
          
          <div className="space-y-1 relative z-10">
            <h3 className={`text-[28px] font-black ${card.color} tracking-tighter leading-none`}>
              {card.value.toLocaleString()}
            </h3>
            <p className="text-[10px] font-black text-[#909090] uppercase tracking-[0.2em]">{card.label}</p>
          </div>
          
          <div className="mt-6 pt-5 border-t border-[#f8f8f8] flex items-center justify-between relative z-10">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${card.isUp ? 'bg-[#2ba640]' : 'bg-[#d93025]'} animate-pulse`} />
                <span className="text-[10px] font-bold text-[#aaaaaa]">Real-time Track</span>
             </div>
             <motion.div 
              whileHover={{ x: 3 }}
              className="w-8 h-8 rounded-full bg-[#f8f9fa] flex items-center justify-center text-[#909090] cursor-pointer"
             >
                <TrendingUp size={14} className={card.isUp ? '' : 'rotate-180'} />
             </motion.div>
          </div>
        </motion.div>
      ))}

      {/* Special AI Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#0f0f0f] rounded-[32px] p-6 shadow-xl shadow-black/10 relative overflow-hidden group col-span-1 min-h-[220px]"
      >
         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <Zap size={100} className="text-white" fill="white" />
         </div>
         <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
               <Zap size={20} fill="white" />
            </div>
            <div className="mt-8">
               <h3 className="text-white text-[15px] font-black uppercase tracking-widest leading-snug mb-1">AI Efficiency</h3>
               <p className="text-white/60 text-xs font-medium leading-relaxed">System is running at 98.4% accuracy across all linked channels.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
               <span className="text-[10px] font-black text-white uppercase bg-white/10 px-2 py-0.5 rounded tracking-tighter">Healthy</span>
               <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[98%] animate-pulse" />
               </div>
            </div>
         </div>
      </motion.div>
    </div>
  );
};

export default StatsGrid;
