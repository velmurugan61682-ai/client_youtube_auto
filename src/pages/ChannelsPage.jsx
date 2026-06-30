import React from 'react';
import { PlaySquare, Trash2, Calendar, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const ChannelsPage = ({ channels, onDisconnect, onAdd, setActiveTab, setSelectedChannelId }) => {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0f0f0f] tracking-tighter">Connected Channels</h1>
          <p className="text-[#606060] font-medium mt-1">Manage your linked YouTube accounts and moderation settings.</p>
        </div>
        <button 
          onClick={onAdd}
          className="yt-btn-primary flex items-center gap-2 px-6 py-3"
        >
          <PlaySquare size={20} fill="currentColor" />
          Link New Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <motion.div 
            key={channel.channelId} 
            layout
            className="yt-card group hover:border-[#ff0000]/30 transition-all !p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#f9f9f9] border border-[#f0f0f0] overflow-hidden flex-shrink-0 shadow-inner">
                <img 
                  src={channel.thumbnailUrl || `https://ui-avatars.com/api/?name=${channel.title}&background=f0f0f0`} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-black text-[#0f0f0f] truncate">{channel.title}</h3>
                <p className="text-[12px] font-bold text-[#909090] mt-0.5">ID: {channel.channelId.substring(0, 12)}...</p>
                <div className="mt-4 flex items-center gap-3">
                   <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2ba640] bg-[#e6f4ea] px-2.5 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2ba640] animate-pulse"></div>
                      Active
                   </div>
                   <span className="text-[11px] font-bold text-[#909090] uppercase tracking-widest">Scanning Live</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-5 border-t border-[#f8f8f8] flex items-center justify-between">
               <button 
                 onClick={() => {
                   setSelectedChannelId(channel.channelId);
                   setActiveTab('videos');
                 }}
                 className="text-[13px] font-bold text-[#065fd4] hover:underline flex items-center gap-1"
               >
                 View Videos
               </button>
               <button 
                 onClick={() => onDisconnect(channel.channelId, channel.title)}
                 className="text-[13px] font-bold text-[#909090] hover:text-[#d93025] transition-colors flex items-center gap-1"
               >
                 Disconnect
               </button>
            </div>
          </motion.div>
        ))}

        {/* Add Card */}
        <button 
          onClick={onAdd}
          className="yt-card border-dashed border-[#cccccc] flex flex-col items-center justify-center gap-4 text-[#909090] hover:text-[#0f0f0f] hover:border-[#909090] bg-[#fcfcfc] min-h-[180px] transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center">
            <PlaySquare size={24} />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-black">Link New Account</p>
            <p className="text-[12px] font-medium mt-1">Connect another channel</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChannelsPage;
