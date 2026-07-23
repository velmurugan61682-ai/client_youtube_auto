import React from 'react';
import { PlaySquare, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const ChannelsPage = ({ channels, onDisconnect, onAdd, setActiveTab, setSelectedChannelId }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[calc(100svh-5.5rem)] min-[1025px]:h-[calc(100vh-2.5rem)] min-[1025px]:min-h-[760px] overflow-visible min-[1025px]:overflow-hidden rounded-[28px] bg-[#eef3f5] p-4 sm:p-5 text-[#0f0f0f]">
      <div className="rounded-[22px] bg-white border border-[#e5e5e5] shadow-sm px-5 sm:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0f0f0f] tracking-tighter">Connected Channels</h1>
        </div>
        <button
          onClick={onAdd}
          className="yt-btn-primary flex items-center gap-2 px-6 py-3"
        >
          <PlaySquare size={20} fill="currentColor" />
          Link New Account
        </button>
      </div>

      <div className="custom-scroll mt-4 h-[calc(100%-96px)] overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start">
        {channels.map((channel) => (
          <motion.div
            key={channel.channelId}
            layout
            className="yt-card group hover:border-[#ff0000]/30 transition-all !p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-[#f9f9f9] border border-[#e5e5e5] overflow-hidden flex-shrink-0 shadow-sm">
                <img
                  src={channel.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=ff0000&color=ffffff`}
                  alt={channel.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-[#0f0f0f] truncate">{channel.title}</h3>
                <p className="text-[11px] font-semibold text-[#909090] mt-0.5">ID: {channel.channelId?.substring(0, 14)}...</p>
                
                <div className="mt-3 flex items-center gap-2.5">
                  {channel.reconnectRequired ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-[#d93025] bg-[#fce8e6] px-2.5 py-0.5 rounded-full" title={channel.reconnectReason || 'Token invalid or revoked'}>
                      <AlertTriangle size={11} className="text-[#d93025]" />
                      Reconnect Required
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-[#ff0000] bg-[#fff1f1] px-2.5 py-0.5 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff0000] animate-pulse"></div>
                      Active
                    </div>
                  )}
                  <span className="text-[10px] font-black text-[#909090] uppercase tracking-wider">
                    {channel.reconnectRequired ? 'Paused' : 'Scanning Live'}
                  </span>
                </div>

                {/* Channel Statistics - Subscribers & Videos Only */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-[#f9f9f9] border border-[#f0f0f0] rounded-xl p-2.5 text-center">
                    <p className="text-sm font-black text-[#0f0f0f]">
                      {Number(channel.statistics?.subscriberCount || 0).toLocaleString()}
                    </p>
                    <p className="text-[9px] font-black text-[#909090] uppercase tracking-wider mt-0.5">Subscribers</p>
                  </div>
                  <div className="bg-[#f9f9f9] border border-[#f0f0f0] rounded-xl p-2.5 text-center">
                    <p className="text-sm font-black text-[#0f0f0f]">
                      {Number(channel.statistics?.videoCount || 0).toLocaleString()}
                    </p>
                    <p className="text-[9px] font-black text-[#909090] uppercase tracking-wider mt-0.5">Videos</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#f8f8f8] flex items-center justify-between">
              {channel.reconnectRequired ? (
                <button
                  onClick={onAdd}
                  className="text-[13px] font-bold text-[#d93025] hover:underline flex items-center gap-1"
                >
                  Reconnect Now
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedChannelId(channel.channelId);
                    setActiveTab('videos');
                  }}
                  className="text-[13px] font-bold text-[#065fd4] hover:underline flex items-center gap-1"
                >
                  View Videos
                </button>
              )}
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


