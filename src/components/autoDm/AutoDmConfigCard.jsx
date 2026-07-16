import React, { useState, useEffect } from 'react';
import { PlaySquare, Video, Phone, ExternalLink } from 'lucide-react';
import api from '../../services/api';

const AutoDmConfigCard = ({
  channels,
  selectedChannelId,
  onChannelChange,
  selectedVideoId,
  onVideoChange,
  enabled,
  onEnabledChange,
  whatsappNumber,
  onWhatsappNumberChange,
  onSave,
  saving,
}) => {
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  useEffect(() => {
    if (selectedChannelId) {
      fetchVideosForChannel(selectedChannelId);
    } else {
      setVideos([]);
    }
  }, [selectedChannelId]);

  const fetchVideosForChannel = async (channelId) => {
    try {
      setLoadingVideos(true);
      const res = await api.get('/youtube/videos', { params: { channelId } });
      console.log('[Fix #1] Videos API response for channel', channelId, ':', res.data);

      // Authoritative extraction: the endpoint always returns { videos: [...] }
      const videosArray = Array.isArray(res.data)
        ? res.data
        : (res.data && Array.isArray(res.data.videos))
          ? res.data.videos
          : (res.data && Array.isArray(res.data.data))
            ? res.data.data
            : [];

      console.log(`[Fix #1] Loaded ${videosArray.length} videos for channel ${channelId}. First title: "${videosArray[0]?.title}" (AutoDmConfigCard.jsx)`);
      setVideos(videosArray);

      // If there are videos and none is selected, select the first one
      if (videosArray && videosArray.length > 0 && !selectedVideoId) {
        onVideoChange(videosArray[0].videoId);
      }
    } catch (err) {
      console.error('[Fix #1] Error fetching videos for channel:', err);
    } finally {
      setLoadingVideos(false);
    }
  };

  const cleanNumber = (whatsappNumber || '').replace(/[^\d]/g, '');
  const waLink = cleanNumber ? `https://wa.me/${cleanNumber}` : '';

  return (
    <div className="space-y-6">
      {/* Selection Card */}
      <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-[#0f0f0f] tracking-tight mb-4">Select Channel & Video</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Channel Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-black text-[#909090] uppercase tracking-wider flex items-center gap-1.5">
              <PlaySquare size={14} className="text-[#22c55e]" /> YouTube Channel
            </label>
            <select
              value={selectedChannelId || ''}
              onChange={(e) => onChannelChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#0f0f0f] focus:outline-none focus:border-[#22c55e]/30 transition-all cursor-pointer"
            >
              <option value="" disabled>Select a connected channel</option>
              {channels.map((chan) => (
                <option key={chan.channelId} value={chan.channelId}>
                  {chan.title}
                </option>
              ))}
            </select>
          </div>

          {/* Video Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-black text-[#909090] uppercase tracking-wider flex items-center gap-1.5">
              <Video size={14} className="text-[#22c55e]" /> YouTube Video
            </label>
            <select
              value={selectedVideoId || ''}
              onChange={(e) => onVideoChange(e.target.value)}
              disabled={loadingVideos || !selectedChannelId}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#0f0f0f] focus:outline-none focus:border-[#22c55e]/30 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {loadingVideos ? 'Loading videos...' : 'Select a video'}
              </option>
              {Array.isArray(videos) && videos.map((vid) => (
                <option key={vid.videoId} value={vid.videoId}>
                  {vid.title || vid.videoId}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Video Player Embed */}
        {selectedVideoId && (
          <div className="pt-4 border-t border-slate-100">
            <iframe
              className="w-full aspect-video rounded-xl border border-[#e5e5e5] shadow-sm"
              src={`https://www.youtube.com/embed/${selectedVideoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer *; autoplay; clipboard-write; encrypted-media; gyroscope *; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Video Toggle Status */}
        {selectedVideoId && (
          <div className="flex items-center justify-between gap-6 pt-4 border-t border-slate-100">
            <div>
              <p className="text-[14px] font-black text-[#0f0f0f] mb-1">Enable Auto DM for this video</p>
              <p className="text-[12px] text-[#909090] font-semibold leading-relaxed">
                When enabled, the background automation job will start checking comments for this video.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onEnabledChange(!enabled)}
              className={`ios-toggle ${enabled ? 'active' : ''}`}
            >
              <div className="ios-toggle-thumb" />
            </button>
          </div>
        )}
      </div>

      {/* WhatsApp Link Card */}
      <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-[#0f0f0f] tracking-tight">WhatsApp Settings</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-[#909090] uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={14} className="text-[#22c55e]" /> WhatsApp Number
            </label>
            <input
              type="text"
              placeholder="e.g. +919999999999"
              value={whatsappNumber}
              onChange={(e) => onWhatsappNumberChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#22c55e]/30 transition-all font-semibold text-[#0f0f0f]"
            />
            <p className="text-[10px] text-[#909090] font-semibold leading-relaxed">
              Enter number with country code, e.g., +919999999999 (without brackets, spaces or leading zeros).
            </p>
          </div>

          {/* Link Live Preview */}
          {waLink && (
            <div className="p-4 bg-green-500/10 border border-green-500/10 rounded-2xl">
              <p className="text-[10px] font-black text-[#22c55e] uppercase tracking-wider mb-1">Generated WA.me Link Preview</p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-[#0f0f0f] flex items-center gap-1 hover:underline text-wrap break-all"
              >
                {waLink}
                <ExternalLink size={14} className="text-[#22c55e] flex-shrink-0" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoDmConfigCard;
