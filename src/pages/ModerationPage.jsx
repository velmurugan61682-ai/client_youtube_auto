import React from 'react';
import ModerationQueue from '../components/ModerationQueue';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const ModerationPage = ({ channels, onAction, searchQuery }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#ff0000]/5 text-[#ff0000] rounded-2xl">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#0f0f0f] tracking-tighter">Smart Moderation</h1>
          <p className="text-[#606060] font-medium mt-0.5">Review and manage flagged comments across all connected channels.</p>
        </div>
      </div>

      <div className="yt-card !p-0 overflow-hidden shadow-xl border-[#f0f0f0]">
        <ModerationQueue 
          onAction={onAction} 
          searchQuery={searchQuery} 
          channels={channels}
        />
      </div>
    </motion.div>
  );
};

export default ModerationPage;
