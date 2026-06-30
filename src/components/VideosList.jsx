import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  PlaySquare, 
  MessageSquare, 
  Clock, 
  RefreshCw, 
  Loader2,
  ChevronRight,
  Filter,
  Trash2,
  ThumbsUp,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Search,
  LogOut
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { getSentimentConfig, SENTIMENT_COLORS } from '../utils/constants/sentimentColors';

const VideosList = ({ 
  channelId, 
  onAction, 
  searchQuery, 
  isEmbedded = false, 
  channels = [], 
  selectedChannelId, 
  setSelectedChannelId,
  onLogout
}) => {
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (channelId) {
      fetchVideos();
    } else {
      setLoadingVideos(false);
    }
  }, [channelId]);

  const fetchVideos = async () => {
    try {
      setLoadingVideos(true);
      const res = await api.get('/youtube/videos', { params: { channelId } });
      const fetchedVideos = res.data.videos || [];
      setVideos(fetchedVideos);
      if (fetchedVideos.length > 0 && !selectedVideo) {
        handleVideoSelect(fetchedVideos[0].videoId);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleVideoSelect = async (videoId) => {
    try {
      setSelectedVideo(videoId);
      setLoadingComments(true);
      const res = await api.get('/comments', { params: { videoId } });
      setComments(res.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const [processingId, setProcessingId] = useState(null);

  const handleAction = async (id, action) => {
    // Optimistic UI Update
    const originalComments = [...comments];
    
    try {
      setProcessingId(id);
      
      // Update local state immediately for better UX
      setComments(prev => prev.map(c => {
        if (c._id !== id) return c;
        const updated = { ...c };
        if (action === 'approve') updated.status = 'approved';
        if (action === 'delete') updated.status = 'deleted';
        if (action === 'hide') updated.status = 'flagged';
        if (action === 'like') updated.autoLiked = true;
        return updated;
      }));

      const res = await api.post(`/comments/${id}/action`, { action });
      
      if (!res.data.success) {
        throw new Error(res.data.error || 'Action failed');
      }

      // Sync stats in parent
      if (onAction) onAction();
      
    } catch (err) {
      console.error('Action failed:', err);
      // Revert on failure
      setComments(originalComments);
      
      const errorMsg = err.response?.data?.error || err.message || 'Moderation action failed.';
      alert(`Action failed: ${errorMsg}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAudit = async () => {
    if (!selectedVideo) return;
    try {
      setLoadingComments(true);
      await api.get(`/comments/analyze/${selectedVideo}`, { params: { channelId } });
      handleVideoSelect(selectedVideo);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const filteredComments = comments.filter(c => {
    if (filter === 'all') return true;
    return c.sentiment === filter;
  });

  const getStatsForFilter = (type) => {
    if (type === 'all') return comments.length;
    return comments.filter(c => c.sentiment === type).length;
  };

  const filters = [
    { id: 'all', label: 'All', color: 'bg-[#f2f2f2] text-[#0f0f0f]' },
    { id: 'positive', label: 'Positive', color: `${SENTIMENT_COLORS.positive.bgColor} ${SENTIMENT_COLORS.positive.iconColor}` },
    { id: 'toxic', label: 'Toxic', color: `${SENTIMENT_COLORS.toxic.bgColor} ${SENTIMENT_COLORS.toxic.iconColor}` },
    { id: 'moderate', label: 'Moderate', color: `${SENTIMENT_COLORS.moderate.bgColor} ${SENTIMENT_COLORS.moderate.iconColor}` },
  ];

  if (!channelId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-[#f0f0f0] my-4 shadow-sm">
        <PlaySquare size={48} className="text-[#909090] mb-3" />
        <h3 className="text-lg font-bold text-[#0f0f0f]">No Channel Connected</h3>
        <p className="text-xs text-[#909090] max-w-[320px] mt-1 font-medium leading-relaxed">
          Please connect your YouTube channel using an API key or OAuth in the Settings page to analyze videos and comments.
        </p>
      </div>
    );
  }

  if (loadingVideos && videos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#ff0000]" size={40} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col lg:flex-row h-full ${isEmbedded ? 'gap-2 lg:gap-4 bg-[#f9f9f9]' : 'gap-4 md:gap-6'} overflow-hidden`}>
      {/* Left Pane: Videos List */}
      <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-hidden shrink-0 h-[40%] lg:h-full">
        <div className={`yt-card !p-0 flex flex-col h-full overflow-hidden ${isEmbedded ? '!rounded-none !border-y-0 !border-l-0 !shadow-none' : ''}`}>
           <div className="p-4 md:p-5 border-b border-[#f0f0f0] flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h3 className="text-base md:text-lg font-black text-[#0f0f0f] tracking-tight truncate">Channel Videos</h3>
                {isEmbedded && channels.length > 1 && (
                  <select 
                    value={selectedChannelId || ''} 
                    onChange={(e) => setSelectedChannelId(e.target.value)}
                    className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg px-2 py-1.5 text-xs font-bold text-[#0f0f0f] shadow-sm outline-none cursor-pointer max-w-[130px] truncate"
                  >
                    {channels.map(c => <option key={c.channelId} value={c.channelId}>{c.title}</option>)}
                  </select>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={fetchVideos} className="p-2 hover:bg-[#f2f2f2] rounded-full text-[#909090] transition-colors" title="Refresh videos">
                   <RefreshCw size={16} className={loadingVideos ? 'animate-spin' : ''} />
                </button>
                {isEmbedded && onLogout && (
                  <button
                    onClick={onLogout}
                    title="Switch Account"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold text-[#909090] hover:text-[#d93025] hover:bg-[#fce8e6] transition-all border border-transparent hover:border-[#d93025]/20"
                  >
                    <LogOut size={12} />
                    <span>Switch</span>
                  </button>
                )}
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scroll p-2">
              {videos.map((video) => (
                <button
                  key={video.videoId}
                  onClick={() => handleVideoSelect(video.videoId)}
                  className={`w-full flex gap-3 p-2.5 md:p-3 rounded-xl transition-all text-left mb-1 group ${
                    selectedVideo === video.videoId ? 'bg-[#fff1f0] border border-[#ff0000]/10' : 'hover:bg-[#f9f9f9] border border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0 w-20 md:w-24 h-12 md:h-14 rounded-lg overflow-hidden bg-[#f0f0f0] shadow-sm">
                    <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <h4 className={`text-[12px] md:text-[13px] font-bold line-clamp-1 md:line-clamp-2 leading-snug ${selectedVideo === video.videoId ? 'text-[#ff0000]' : 'text-[#0f0f0f]'}`}>
                      {video.title}
                    </h4>
                    <p className="text-[10px] md:text-[11px] font-medium text-[#909090] mt-0.5 md:mt-1 flex items-center gap-1">
                      <Clock size={10} /> {formatDistanceToNow(new Date(video.publishedAt))} ago
                    </p>
                  </div>
                  {selectedVideo === video.videoId && <ChevronRight size={16} className="text-[#ff0000] self-center hidden md:block" />}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Right Pane: Analysis & Comments */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-[60%] lg:h-full">
        <div className={`yt-card !p-0 flex flex-col h-full overflow-hidden ${isEmbedded ? '!rounded-none !border-y-0 !border-r-0 !shadow-none' : ''}`}>
          {/* Header & Filters */}
          <div className="p-4 md:p-6 border-b border-[#f0f0f0] bg-white sticky top-0 z-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
               <div>
                  <h3 className="text-lg md:text-xl font-black text-[#0f0f0f] tracking-tight">Video Analysis</h3>
                  <p className="text-[11px] md:text-xs text-[#909090] font-medium mt-1">AI-driven auditing for your latest content</p>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={handleAudit} className="yt-btn-primary !py-2 !px-4 flex-1 sm:flex-none">
                    <RefreshCw size={16} className={loadingComments ? 'animate-spin' : ''} /> <span className="text-xs">Audit Again</span>
                  </button>
                  <a 
                    href={`https://youtube.com/watch?v=${selectedVideo}`} 
                    target="_blank" 
                    className="p-2.5 bg-[#f8f8f8] border border-[#e5e5e5] rounded-xl hover:bg-[#f2f2f2] transition-colors"
                  >
                    <ExternalLink size={18} />
                  </a>
               </div>
            </div>

            <div className="flex flex-wrap gap-1.5 md:gap-2">
               {filters.map(f => (
                 <button
                   key={f.id}
                   onClick={() => setFilter(f.id)}
                   className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[11px] md:text-xs font-bold transition-all border ${
                     filter === f.id ? 'bg-[#0f0f0f] text-white border-[#0f0f0f] shadow-md scale-105' : `bg-white border-[#e5e5e5] ${f.color.split(' ')[1]} hover:border-[#cccccc]`
                   }`}
                 >
                   {f.label}
                   <span className={`px-1.5 py-0.5 rounded-md text-[9px] md:text-[10px] ${filter === f.id ? 'bg-white/20 text-white' : 'bg-[#f0f0f0] text-[#606060]'}`}>
                     {getStatsForFilter(f.id)}
                   </span>
                 </button>
               ))}
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto custom-scroll p-3 md:p-6 bg-[#fafafa]">
             {loadingComments ? (
               <div className="h-full flex flex-col items-center justify-center gap-4 text-[#909090]">
                 <Loader2 className="animate-spin text-[#ff0000]" size={32} />
                 <p className="text-[11px] md:text-sm font-bold uppercase tracking-widest">Analysing Feedback...</p>
               </div>
             ) : filteredComments.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-[#909090] opacity-50 py-12">
                 <MessageSquare size={48} className="mb-4" />
                 <p className="text-base md:text-lg font-bold">No comments found</p>
               </div>
             ) : (
               <div className="space-y-3 md:space-y-4 max-w-[900px] mx-auto">
                 {filteredComments
                    .filter(c => c.text.toLowerCase().includes((searchQuery || '').toLowerCase()) || c.author.toLowerCase().includes((searchQuery || '').toLowerCase()))
                    .map((comment, index) => (
                    <motion.div 
                      key={comment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white border border-[#f0f0f0] p-4 md:p-5 rounded-[20px] shadow-sm hover:shadow-md transition-all group ${comment.status === 'deleted' ? 'opacity-40 grayscale' : ''}`}
                    >
                      <div className="flex gap-3 md:gap-4">
                        <div className="relative flex-shrink-0">
                           <img 
                            src={comment.authorProfileImageUrl || `https://ui-avatars.com/api/?name=${comment.author}&background=random`} 
                            className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-[#f0f0f0]" 
                            alt=""
                           />
                           <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 border-white flex items-center justify-center" style={{ backgroundColor: getSentimentConfig(comment.sentiment).color }}>
                              {comment.sentiment === 'toxic' ? <ShieldAlert size={8} className="text-white" /> : <ThumbsUp size={8} className="text-white" />}
                           </div>
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5 md:gap-2">
                                <span className="font-black text-[12px] md:text-[14px] text-[#0f0f0f] truncate max-w-[100px] md:max-w-none">@{comment.author}</span>
                                <span className={`yt-badge ${getSentimentConfig(comment.sentiment).badgeClass} capitalize`}>
                                  {comment.sentiment}
                                </span>
                              </div>
                              <span className="text-[9px] md:text-[11px] font-bold text-[#909090] uppercase tracking-tighter whitespace-nowrap">
                                {formatDistanceToNow(new Date(comment.publishedAt))} ago
                              </span>
                           </div>
                           <p className="text-[13px] md:text-[14px] text-[#222] leading-relaxed mb-3 md:mb-4">{comment.text}</p>
                           
                           {comment.status !== 'deleted' && (
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#f8f8f8] pt-3 gap-3">
                                <div className="flex items-center flex-wrap gap-3 md:gap-4 text-[#909090] opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                      onClick={() => handleAction(comment._id, 'approve')} 
                                      disabled={processingId === comment._id}
                                      className={`flex items-center gap-1.5 hover:text-[#2ba640] transition-colors text-[11px] md:text-xs font-bold ${processingId === comment._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                       {processingId === comment._id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={14} />} 
                                       <span className="hidden xs:inline">Approve</span>
                                   </button>
                                   <button 
                                      onClick={() => handleAction(comment._id, 'like')} 
                                      disabled={processingId === comment._id || comment.autoLiked || comment.likeStatus === 'not_supported'}
                                      className={`flex items-center gap-1.5 hover:text-[#065fd4] transition-colors text-[11px] md:text-xs font-bold ${processingId === comment._id || comment.autoLiked || comment.likeStatus === 'not_supported' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                       {processingId === comment._id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={14} className={comment.autoLiked ? 'fill-[#065fd4]' : ''} />} 
                                       <span className="hidden xs:inline">
                                         {comment.likeStatus === 'not_supported' ? 'Like (Unsupported)' : comment.autoLiked ? 'Liked' : 'Like'}
                                       </span>
                                   </button>
                                   <button 
                                      onClick={() => handleAction(comment._id, 'hide')} 
                                      disabled={processingId === comment._id}
                                      className={`flex items-center gap-1.5 hover:text-[#f9ab00] transition-colors text-[11px] md:text-xs font-bold ${processingId === comment._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                       {processingId === comment._id ? <Loader2 size={12} className="animate-spin" /> : <ShieldAlert size={14} />} 
                                       <span className="hidden xs:inline">Hide</span>
                                   </button>
                                   <button 
                                      onClick={() => handleAction(comment._id, 'delete')} 
                                      disabled={processingId === comment._id}
                                      className={`flex items-center gap-1.5 hover:text-[#d93025] transition-colors text-[11px] md:text-xs font-bold ${processingId === comment._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                       {processingId === comment._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={14} />} 
                                       <span className="hidden xs:inline">Remove</span>
                                   </button>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getSentimentConfig(comment.sentiment).color }}></div>
                                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest" style={{ color: getSentimentConfig(comment.sentiment).color }}>
                                    AI Score: {Math.round((comment.confidence || 0) * 100)}%
                                  </span>
                                </div>
                             </div>
                           )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideosList;
