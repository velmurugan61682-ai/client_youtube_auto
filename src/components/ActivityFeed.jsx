import React from 'react';
import { 
  Zap, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert,
  Clock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSentimentConfig } from '../utils/constants/sentimentColors.js';

const ActivityFeed = ({ activities }) => {
  return (
    <div className="w-full flex flex-col min-h-[300px]">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence initial={false}>
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#f8f9fa] p-4 rounded-[20px] border border-[#f0f0f0] relative group hover:border-[#ff0000]/20 hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white shadow-sm border border-[#f0f0f0]" style={{ 
                    color: getSentimentConfig(activity.status === 'deleted' ? 'toxic' : (activity.autoLiked ? 'positive' : 'neutral')).color 
                  }}>
                    {activity.status === 'deleted' ? <Trash2 size={18} /> : 
                     activity.autoLiked ? <Zap size={18} /> : <MessageSquare size={18} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[13px] font-black text-[#0f0f0f] truncate">
                        {activity.status === 'deleted' ? 'Comment Deleted' : 
                         activity.autoLiked ? 'Auto-Liked' : 'New Comment'}
                      </p>
                      {activity.language && (
                        <span className="text-[9px] font-black uppercase text-[#909090] bg-[#f0f0f0] px-1.5 py-0.5 rounded">
                          {activity.language}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[12px] text-[#606060] line-clamp-2 italic leading-relaxed mb-3">
                      "{activity.text}"
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-[#f0f0f0]/50">
                      <span className="text-[10px] font-bold text-[#909090] flex items-center gap-1">
                        <Clock size={10} /> Just now
                      </span>
                      <span className="text-[10px] font-black text-[#ff0000] uppercase tracking-tighter">@{activity.author}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {activities.length === 0 && (
           <div className="h-64 flex flex-col items-center justify-center text-center p-8 opacity-40">
              <div className="p-5 bg-[#f8f9fa] rounded-full mb-4">
                <ShieldAlert size={40} className="text-[#909090]" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#909090]">Awaiting Live Feedback...</p>
           </div>
        )}
      </div>

      <div className="p-4 bg-[#f8f9fa]/50 border-t border-[#f0f0f0] flex justify-end">
        <button 
          onClick={() => alert('Feed paused. Real-time updates are temporarily suspended.')}
          className="px-6 py-2 bg-white border border-[#e5e5e5] hover:border-[#ff0000]/30 hover:text-[#ff0000] text-[#606060] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
        >
          Pause Feed
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
