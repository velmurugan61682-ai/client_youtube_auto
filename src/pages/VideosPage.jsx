import React from 'react';
import VideosList from '../components/VideosList';
import { PlaySquare } from 'lucide-react';
import { motion } from 'framer-motion';

const VideosPage = ({ 
  channels, 
  selectedChannelId, 
  setSelectedChannelId, 
  fetchAnalytics, 
  searchQuery,
  isEmbedded,
  onLogout
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0f0f0f] tracking-tighter">Video Library</h1>
          <p className="text-[14px] text-[#606060] font-medium mt-1">Manage and moderate comments for your content.</p>
        </div>
        
        {!isEmbedded && channels.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#909090] uppercase tracking-wider">Channel:</span>
            <select 
              value={selectedChannelId || ''} 
              onChange={(e) => setSelectedChannelId(e.target.value)}
              className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2 text-sm font-bold text-[#0f0f0f] shadow-sm outline-none cursor-pointer hover:border-[#ff0000]/30 transition-all"
            >
              <option value="" disabled>Select a Channel</option>
              {channels.map(c => <option key={c.channelId} value={c.channelId}>{c.title}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <VideosList 
          channelId={selectedChannelId || channels[0]?.channelId} 
          onAction={fetchAnalytics} 
          searchQuery={searchQuery}
          isEmbedded={isEmbedded}
          channels={channels}
          selectedChannelId={selectedChannelId}
          setSelectedChannelId={setSelectedChannelId}
          onLogout={onLogout}
        />
      </div>
    </motion.div>
  );
};

export default VideosPage;
