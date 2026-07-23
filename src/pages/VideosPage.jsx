import React from 'react';
import VideosList from '../components/VideosList';;
import { motion } from 'framer-motion';

const VideosPage = ({
  channels,
  selectedChannelId,
  setSelectedChannelId,
  fetchAnalytics,
  searchQuery,
  isEmbedded,
  onLogout,
  videoSubTab,
  setVideoSubTab
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-[calc(100svh-5.5rem)] min-[1025px]:h-[calc(100vh-2.5rem)] min-[1025px]:min-h-[760px] overflow-visible lg:overflow-hidden rounded-[22px] sm:rounded-[28px] bg-[#eef3f5] p-3 sm:p-5 text-[#0f0f0f] flex flex-col"
    >
      <div className="rounded-[22px] bg-white border border-[#e5e5e5] shadow-sm px-4 sm:px-7 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0f0f0f] tracking-tighter">Video Library</h1>
        </div>

        {!isEmbedded && channels.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#909090] uppercase tracking-wider">Channel:</span>
            <select
              value={selectedChannelId || ''}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              className="min-h-[44px] w-full md:w-auto bg-white border border-[#e5e5e5] rounded-xl px-4 py-2 text-sm font-bold text-[#0f0f0f] shadow-sm outline-none cursor-pointer hover:border-[#ff0000]/30 transition-all"
            >
              <option value="" disabled>Select a Channel</option>
              {channels.map(c => <option key={c.channelId} value={c.channelId}>{c.title}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="custom-scroll mt-4 flex-1 min-h-0 overflow-visible lg:overflow-y-auto pr-0 lg:pr-1">
        <VideosList
          channelId={selectedChannelId || channels[0]?.channelId}
          onAction={fetchAnalytics}
          searchQuery={searchQuery}
          isEmbedded={isEmbedded}
          channels={channels}
          selectedChannelId={selectedChannelId}
          setSelectedChannelId={setSelectedChannelId}
          onLogout={onLogout}
          videoSubTab={videoSubTab}
          setVideoSubTab={setVideoSubTab}
        />
      </div>
    </motion.div>
  );
};

export default VideosPage;


