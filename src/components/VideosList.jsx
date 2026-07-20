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
  LogOut,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { getSentimentConfig, SENTIMENT_COLORS } from '../utils/constants/sentimentColors';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const safeFormatDistanceToNow = (dateStr) => {
  try {
    if (!dateStr) return 'some time';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'some time';
    return formatDistanceToNow(date);
  } catch (e) {
    return 'some time';
  }
};

const parseISO8601Duration = (durationStr) => {
  if (!durationStr) return { seconds: 0, formatted: '00:00' };
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = durationStr.match(regex);
  if (!matches) {
    return { seconds: 0, formatted: durationStr };
  }
  const hours = parseInt(matches[1] || 0, 10);
  const minutes = parseInt(matches[2] || 0, 10);
  const seconds = parseInt(matches[3] || 0, 10);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  let formatted = '';
  if (hours > 0) {
    formatted += hours + ':';
    formatted += String(minutes).padStart(2, '0') + ':';
  } else {
    formatted += minutes + ':';
  }
  formatted += String(seconds).padStart(2, '0');
  return { seconds: totalSeconds, formatted };
};

const formatChartDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

const VideosList = ({ 
  channelId, 
  onAction, 
  searchQuery, 
  isEmbedded = false, 
  channels = [], 
  selectedChannelId, 
  setSelectedChannelId,
  onLogout,
  videoSubTab,
  setVideoSubTab
}) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [localVideoTab, setLocalVideoTab] = useState('videos'); // 'videos', 'shorts', or 'posts'
  const videoTab = videoSubTab !== undefined ? videoSubTab : localVideoTab;
  const setVideoTab = setVideoSubTab !== undefined ? setVideoSubTab : setLocalVideoTab;
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [filter, setFilter] = useState('all');

  const processedVideos = (videos || []).map(v => {
    if (v.isPost) {
      return { ...v, durationSeconds: 0, formattedDuration: '' };
    }
    const { seconds, formatted } = parseISO8601Duration(v.duration);
    return {
      ...v,
      durationSeconds: seconds,
      formattedDuration: v.duration ? formatted : '--:--'
    };
  });

  const longVideos = processedVideos.filter(v => !v.isPost && (!v.duration || v.durationSeconds >= 60));
  const shortVideos = processedVideos.filter(v => !v.isPost && v.duration && v.durationSeconds < 60);
  const communityPosts = processedVideos.filter(v => v.isPost);

  const activeVideosList = videoTab === 'videos' ? longVideos : (videoTab === 'shorts' ? shortVideos : communityPosts);
  const selectedVideoData = processedVideos.find(v => v.videoId === selectedVideo);

  useEffect(() => {
    if (activeVideosList.length > 0) {
      const isCurrentSelectedInTab = activeVideosList.some(v => v.videoId === selectedVideo);
      if (!isCurrentSelectedInTab) {
        handleVideoSelect(activeVideosList[0].videoId);
      }
    } else {
      setSelectedVideo(null);
    }
  }, [videoTab, videos]);

  // Analytics and Interactive Tabs
  const [activePanelTab, setActivePanelTab] = useState('comments'); // 'comments' or 'analytics'
  const [videoAnalytics, setVideoAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [submittingLike, setSubmittingLike] = useState(false);

  // Performance optimizations: lazy render limits for videos and comments
  const [displayLimit, setDisplayLimit] = useState(50);
  const [commentsDisplayLimit, setCommentsDisplayLimit] = useState(50);

  useEffect(() => {
    setDisplayLimit(50);
  }, [channelId, videos]);

  useEffect(() => {
    setCommentsDisplayLimit(50);
  }, [selectedVideo, filter]);

  const handleVideoListScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      setDisplayLimit(prev => Math.min(activeVideosList.length, prev + 50));
    }
  };

  const handleCommentsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      setCommentsDisplayLimit(prev => Math.min(filteredComments.length, prev + 50));
    }
  };

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
      const fetchedVideos = Array.isArray(res.data)
        ? res.data
        : (res.data && Array.isArray(res.data.videos))
          ? res.data.videos
          : (res.data && Array.isArray(res.data.data))
            ? res.data.data
            : [];
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
      setLoadingAnalytics(true);
      
      const [commentsRes, analyticsRes] = await Promise.all([
        api.get('/comments', { params: { videoId } }),
        api.get(`/youtube/video/${videoId}/analytics`).catch(err => {
          console.error('Error fetching video analytics:', err);
          return { data: { video: null } };
        })
      ]);
      
      setComments(Array.isArray(commentsRes.data) ? commentsRes.data : (commentsRes.data?.comments || []));
      setVideoAnalytics(analyticsRes.data?.video || null);
    } catch (err) {
      console.error('Error fetching video selection data:', err);
    } finally {
      setLoadingComments(false);
      setLoadingAnalytics(false);
    }
  };

  const handleLikeVideo = async () => {
    if (!selectedVideo || submittingLike) return;
    try {
      setSubmittingLike(true);
      const res = await api.post(`/youtube/video/${selectedVideo}/like`);
      if (res.data?.success) {
        setVideoAnalytics(prev => {
          if (!prev) return null;
          return {
            ...prev,
            statistics: res.data.statistics,
            engagementRate: res.data.engagementRate,
            likesHistory: res.data.likesHistory,
            likedByUsers: res.data.likedByUsers
          };
        });
        // Sync local videos list count
        setVideos(prev => prev.map(v => {
          if (v.videoId !== selectedVideo) return v;
          return {
            ...v,
            statistics: res.data.statistics,
            engagementRate: res.data.engagementRate,
            likesHistory: res.data.likesHistory,
            likedByUsers: res.data.likedByUsers
          };
        }));
      }
    } catch (err) {
      console.error('Failed to submit dashboard like:', err);
      alert(err.response?.data?.error || 'Failed to submit like.');
    } finally {
      setSubmittingLike(false);
    }
  };

  // Auto-refresh analytics stats every 30 seconds
  useEffect(() => {
    let interval;
    if (selectedVideo && activePanelTab === 'analytics') {
      interval = setInterval(() => {
        api.get(`/youtube/video/${selectedVideo}/analytics`)
          .then(res => {
            if (res.data?.video) {
              setVideoAnalytics(res.data.video);
              setVideos(prev => prev.map(v => {
                if (v.videoId !== selectedVideo) return v;
                return {
                  ...v,
                  statistics: res.data.video.statistics,
                  engagementRate: res.data.video.engagementRate,
                  likesHistory: res.data.video.likesHistory,
                  likedByUsers: res.data.video.likedByUsers
                };
              }));
            }
          })
          .catch(err => console.error('Auto-refresh stats error:', err));
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedVideo, activePanelTab]);

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
    if (c.isBotReply || (c.youtubeId && c.youtubeId.includes('.'))) return false;
    if (filter === 'all') return true;
    return c.sentiment === filter;
  });

  const getStatsForFilter = (type) => {
    const topLevelComments = comments.filter(c => !c.isBotReply && !(c.youtubeId && c.youtubeId.includes('.')));
    if (type === 'all') return topLevelComments.length;
    return topLevelComments.filter(c => c.sentiment === type).length;
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
      <div className="flex flex-col lg:flex-row h-full gap-4 md:gap-6 overflow-hidden animate-pulse">
        {/* Left Pane: Videos List Skeleton */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 shrink-0 h-[40%] lg:h-full">
          <div className="bg-white rounded-[32px] border border-[#f0f0f0] p-5 flex flex-col gap-4 h-full">
            <div className="h-5 bg-gray-200 rounded-xl w-1/2 mb-2" />
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="flex gap-3 p-3 border border-[#f0f0f0] rounded-2xl" style={{ contentVisibility: 'auto' }}>
                <div className="w-20 h-12 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right Workspace Skeleton */}
        <div className="flex-1 bg-white rounded-[32px] border border-[#f0f0f0] p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div className="h-6 bg-gray-200 rounded-xl w-1/3" />
            <div className="h-10 bg-gray-200 rounded-2xl w-24" />
          </div>
          <div className="flex-1 flex flex-col gap-4 justify-center items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col lg:flex-row lg:h-full w-full ${isEmbedded ? 'gap-2 lg:gap-4 bg-[#f9f9f9]' : 'gap-4 md:gap-6'} overflow-y-auto lg:overflow-hidden`}>
      {/* Left Pane: Videos List */}
      <div className="w-full lg:w-[320px] flex flex-col gap-4 shrink-0 h-[350px] lg:h-full overflow-hidden">
        <div className={`yt-card !p-0 flex flex-col h-full overflow-hidden ${isEmbedded ? '!rounded-none !border-y-0 !border-l-0 !shadow-none' : ''}`}>
           <div className="p-4 md:p-5 border-b border-white/40 flex items-center justify-between bg-white/20 sticky top-0 z-10 backdrop-blur-md">
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
            
            {/* Tab Selector */}
            <div className="px-4 py-2 border-b border-white/40 bg-white/10 flex gap-1">
              <button
                onClick={() => setVideoTab('videos')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border ${
                  videoTab === 'videos'
                    ? 'bg-green-500/10 text-green-600 border-green-500/20 shadow-sm'
                    : 'text-[#909090] hover:text-[#0f0f0f] border-transparent'
                }`}
              >
                Videos ({longVideos.length})
              </button>
              <button
                onClick={() => setVideoTab('shorts')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border ${
                  videoTab === 'shorts'
                    ? 'bg-green-500/10 text-green-600 border-green-500/20 shadow-sm'
                    : 'text-[#909090] hover:text-[#0f0f0f] border-transparent'
                }`}
              >
                Shorts ({shortVideos.length})
              </button>
              <button
                onClick={() => setVideoTab('posts')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border ${
                  videoTab === 'posts'
                    ? 'bg-green-500/10 text-green-600 border-green-500/20 shadow-sm'
                    : 'text-[#909090] hover:text-[#0f0f0f] border-transparent'
                }`}
              >
                Posts ({communityPosts.length})
              </button>
            </div>
           
            <div className="flex-1 overflow-y-auto custom-scroll p-2" onScroll={handleVideoListScroll}>
              {activeVideosList.slice(0, displayLimit).map((video) => (
                <button
                  key={video.videoId}
                  onClick={() => handleVideoSelect(video.videoId)}
                  className={`w-full flex gap-3 p-3 rounded-2xl transition-all text-left mb-1.5 border group items-center ${
                    selectedVideo === video.videoId ? 'bg-green-500/10 border-green-500/20 text-[#22c55e] shadow-sm' : 'hover:bg-slate-50 border-transparent text-slate-500'
                  }`}
                >
                  <div className="relative flex-shrink-0 w-20 h-12 rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                    <img 
                      src={video.thumbnail ? video.thumbnail.replace('_live.jpg', '.jpg') : ''} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&auto=format&fit=crop&q=60';
                      }}
                    />
                    {video.isPost ? (
                      <span className="absolute bottom-1 right-1 bg-[#22c55e]/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                        POST
                      </span>
                    ) : (
                      <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                        {video.formattedDuration}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
                    <h4 className={`text-[12px] font-black line-clamp-1 group-hover:text-slate-900 transition-colors leading-snug ${selectedVideo === video.videoId ? 'text-[#22c55e]' : 'text-slate-900'}`}>
                      {video.title}
                    </h4>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {safeFormatDistanceToNow(video.publishedAt)} ago
                      </span>
                      <span>•</span>
                      <span>{(video.viewCount || video.statistics?.viewCount || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Video Audit Details:\n- Video ID: ${video.videoId}\n- Title: ${video.title}`);
                      }}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <MoreVertical size={16} />
                    </span>
                    {selectedVideo === video.videoId && <ChevronRight size={16} className="text-[#22c55e] hidden md:block" />}
                  </div>
                </button>
              ))}
            </div>
        </div>
      </div>

      {/* Right Pane: Analysis & Comments */}
      <div className="flex-1 flex flex-col gap-4 lg:overflow-hidden h-auto lg:h-full">
        <div className={`yt-card !p-0 flex flex-col h-auto lg:h-full overflow-visible lg:overflow-hidden ${isEmbedded ? '!rounded-none !border-y-0 !border-l-0 !shadow-none' : ''}`}>
          {/* Header & Panel Tabs */}
          <div className="p-4 md:p-6 border-b border-white/40 bg-white/20 sticky top-0 z-20 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
               <div>
                  <h3 className="text-lg md:text-xl font-black text-[#0f0f0f] tracking-tight">Video Workspace</h3>
                  <p className="text-[11px] md:text-xs text-[#909090] font-medium mt-1">Analyze and moderate your content</p>
               </div>
               <div className="flex items-center gap-2">
                  {activePanelTab === 'comments' && (
                    <button onClick={handleAudit} className="yt-btn-primary !py-2 !px-4 flex-1 sm:flex-none">
                      <RefreshCw size={16} className={loadingComments ? 'animate-spin' : ''} /> <span className="text-xs">Audit Comments</span>
                    </button>
                  )}
                  <a 
                    href={`https://youtube.com/watch?v=${selectedVideo}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2.5 bg-white/40 border border-white/50 rounded-xl hover:bg-white/60 transition-colors"
                  >
                    <ExternalLink size={18} />
                  </a>
               </div>
            </div>
             {/* Tab Toggle buttons */}
            <div className="flex gap-2 border-b border-white/40 pb-3 mb-3">
              <button 
                onClick={() => setActivePanelTab('comments')} 
                className={`py-2 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${
                  activePanelTab === 'comments' 
                    ? 'bg-green-500/10 text-green-600 border-green-500/20 shadow-sm' 
                    : 'text-[#909090] hover:text-[#0f0f0f] bg-white/40 border-transparent hover:bg-white/60'
                }`}
              >
                Comments & Moderation
              </button>
              <button 
                onClick={() => setActivePanelTab('analytics')} 
                className={`py-2 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${
                  activePanelTab === 'analytics' 
                    ? 'bg-gradient-to-r from-green-500/15 to-green-500/5 text-green-600 border-green-500/20 shadow-sm' 
                    : 'text-[#909090] hover:text-[#0f0f0f] bg-white/40 border-transparent hover:bg-white/60'
                }`}
              >
                Dashboard & Analytics
              </button>
            </div>

            {/* Comment Filters (only visible when comments tab is active) */}
            {activePanelTab === 'comments' && (
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                 {filters.map(f => (
                   <button
                     key={f.id}
                     onClick={() => setFilter(f.id)}
                     className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[11px] md:text-xs font-bold transition-all border ${
                       filter === f.id ? 'bg-[#22c55e] text-white border-white/20 shadow-md scale-105' : `bg-white/40 border-white/50 ${f.color.split(' ')[1]} hover:bg-white/60 hover:border-white/70`
                     }`}
                   >
                     {f.label}
                     <span className={`px-1.5 py-0.5 rounded-md text-[9px] md:text-[10px] ${filter === f.id ? 'bg-white/20 text-white' : 'bg-white/50 text-[#606060]'}`}>
                       {getStatsForFilter(f.id)}
                     </span>
                   </button>
                 ))}
              </div>
            )}
          </div>

          {/* Conditional Content Rendering */}
          <div className="flex-1 overflow-y-auto custom-scroll p-3 md:p-6 bg-white/20" onScroll={handleCommentsScroll}>
             {selectedVideoData && selectedVideoData.isPost ? (
               <div className="max-w-[900px] mx-auto mb-6 p-6 bg-white border border-[#f0f0f0] rounded-2xl shadow-md text-left">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white flex items-center justify-center font-black">
                     CM
                   </div>
                   <div>
                     <h4 className="font-black text-[#0f0f0f] text-sm">Channelmate</h4>
                     <p className="text-[11px] text-[#909090] font-bold uppercase tracking-wider">Community Post</p>
                   </div>
                 </div>
                 <p className="text-[14px] text-slate-800 leading-relaxed font-semibold mb-4 whitespace-pre-wrap">
                   {selectedVideoData.description || selectedVideoData.title}
                 </p>
                 {selectedVideoData.thumbnail && (
                   <img 
                     src={selectedVideoData.thumbnail} 
                     alt="Post Attachment" 
                     className="w-full max-h-[400px] object-cover rounded-xl border border-slate-100"
                   />
                 )}
               </div>
             ) : selectedVideo && (
               <div className="max-w-[900px] mx-auto mb-6">
                 <iframe
                   className="w-full aspect-video rounded-2xl border border-[#e5e5e5] shadow-md"
                   src={`https://www.youtube.com/embed/${selectedVideo}`}
                   title="YouTube video player"
                   frameBorder="0"
                   allow="accelerometer *; autoplay; clipboard-write; encrypted-media; gyroscope *; picture-in-picture; web-share"
                   allowFullScreen
                 ></iframe>
               </div>
             )}
             {activePanelTab === 'comments' ? (
                // Comments Tab Content
                loadingComments ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-[#909090]">
                    <Loader2 className="animate-spin text-[#22c55e]" size={32} />
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
                       .slice(0, commentsDisplayLimit)
                       .map((comment, index) => (
                       <motion.div 
                         key={comment._id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: index * 0.05 }}
                          className={`glass-panel glass-panel-hover p-4 md:p-5 rounded-[20px] shadow-sm transition-all group ${comment.status === 'deleted' ? 'opacity-40 grayscale' : ''}`}
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
                                   {safeFormatDistanceToNow(comment.publishedAt)} ago
                                 </span>
                              </div>
                              <p className="text-[13px] md:text-[14px] text-[#222] leading-relaxed mb-3 md:mb-4">{comment.text}</p>
                              
                              {comment.replyText && (comment.replyStatus === 'sent' || comment.hasReplied) && (
                                <div className="mt-4 ml-4 md:ml-6 pl-4 border-l-2 border-green-500/40 space-y-3 bg-green-50/20 p-3 rounded-2xl border border-green-500/10 text-left">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-[10px] font-bold">
                                        AI
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-extrabold text-[11px] md:text-xs text-[#0f0f0f]">Channel Owner (AI Auto-Reply)</span>
                                        <span className="text-[9px] font-black uppercase bg-[#2ba640]/10 text-[#2ba640] px-1.5 py-0.5 rounded-md border border-[#2ba640]/20 flex items-center gap-1">
                                          <span className="w-1 h-1 rounded-full bg-[#2ba640] animate-pulse" />
                                          Sent via DeepSeek
                                        </span>
                                      </div>
                                    </div>
                                    {comment.repliedAt && (
                                      <span className="text-[9px] font-bold text-[#909090]">
                                        {safeFormatDistanceToNow(comment.repliedAt)} ago
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[12px] md:text-[13px] text-[#333] font-medium leading-relaxed bg-white/60 p-3 rounded-xl border border-white/80">
                                    {comment.replyText}
                                  </p>
                                </div>
                              )}

                              {comment.replyStatus === 'failed' && (
                                <div className="mt-4 ml-4 md:ml-6 pl-4 border-l-2 border-red-500/40 space-y-2 bg-red-50/20 p-3 rounded-2xl border border-red-500/10 text-left">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-[10px] font-bold">
                                      AI
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-extrabold text-[11px] md:text-xs text-[#0f0f0f]">Channel Owner (AI Auto-Reply)</span>
                                      <span className="text-[9px] font-black uppercase bg-[#d93025]/10 text-[#d93025] px-1.5 py-0.5 rounded-md border border-[#d93025]/20 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#d93025]" />
                                        Reply Failed
                                      </span>
                                    </div>
                                  </div>
                                  {comment.replyError && (
                                    <p className="text-[11px] text-[#c5221f] font-semibold">
                                      Error: {comment.replyError}
                                    </p>
                                  )}
                                </div>
                              )}

                              {comment.replyStatus === 'pending' && (
                                <div className="mt-4 ml-4 md:ml-6 pl-4 border-l-2 border-amber-500/40 space-y-2 bg-amber-50/20 p-3 rounded-2xl border border-amber-500/10 text-left">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-[10px] font-bold">
                                      AI
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-extrabold text-[11px] md:text-xs text-[#0f0f0f]">Channel Owner (AI Auto-Reply)</span>
                                      <span className="text-[9px] font-black uppercase bg-[#f9ab00]/10 text-[#f9ab00] px-1.5 py-0.5 rounded-md border border-[#f9ab00]/20 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#f9ab00] animate-ping" />
                                        Reply Pending
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
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
                )
             ) : (
                // Analytics Dashboard Tab Content
                loadingAnalytics ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-[#909090] py-12">
                    <Loader2 className="animate-spin text-[#22c55e]" size={32} />
                    <p className="text-[11px] md:text-sm font-bold uppercase tracking-widest">Loading Analytics...</p>
                  </div>
                ) : !videoAnalytics ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#909090] opacity-50 py-12">
                    <RefreshCw size={48} className="mb-4 animate-spin text-[#22c55e]" />
                    <p className="text-base md:text-lg font-bold">Synchronizing Video Statistics...</p>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-[900px] mx-auto text-left">
                    {/* Interactive Widgets Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Like Tracking Widget */}
                      <div className="bg-[#f0fdf4] border border-[#22c55e]/10 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#22c55e]/5 rounded-full blur-xl group-hover:scale-125 transition-all duration-500" />
                        <div className="relative z-10">
                          <span className="text-[10px] font-black text-[#22c55e] uppercase tracking-wider block mb-1">Interactive Action</span>
                          <h4 className="text-sm font-black text-[#0f0f0f] leading-snug">Dashboard Like System</h4>
                          <p className="text-[11px] text-[#606060] font-medium mt-1 leading-relaxed">
                            Increment the internal video analytics tracking counters. Safe from YouTube spam filters.
                          </p>
                        </div>
                        <div className="mt-4 relative z-10 flex items-center gap-3">
                          {(() => {
                            const isAlreadyLiked = videoAnalytics?.likedByUsers?.some(id => 
                              (id && user?.id && id.toString() === user.id.toString()) || 
                              (id && user?._id && id.toString() === user._id.toString())
                            );
                            const isDisabled = isAlreadyLiked || submittingLike;
                            return (
                              <>
                                <button 
                                  onClick={handleLikeVideo}
                                  disabled={isDisabled}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                                    isAlreadyLiked 
                                      ? 'bg-green-500/10 text-[#22c55e] border border-green-500/20 cursor-default animate-none' 
                                      : submittingLike
                                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                        : 'bg-[#22c55e] text-white hover:bg-[#16a34a] hover:scale-[1.03] shadow-md hover:shadow-lg'
                                  }`}
                                >
                                  {submittingLike ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <ThumbsUp size={14} className={isAlreadyLiked ? 'fill-[#22c55e]' : ''} />
                                  )}
                                  <span>{isAlreadyLiked ? 'Liked on Dashboard' : submittingLike ? 'Submitting...' : 'Like Video'}</span>
                                </button>
                                {isAlreadyLiked && (
                                  <span className="text-[10px] font-bold text-[#22c55e] italic">Duplicate prevented</span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Engagement Widget */}
                      <div className="bg-white border border-[#f0f0f0] p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-50 rounded-full blur-xl group-hover:scale-125 transition-all duration-500" />
                        <div className="relative z-10">
                          <span className="text-[10px] font-black text-[#065fd4] uppercase tracking-wider block mb-1">Performance Meter</span>
                          <h4 className="text-sm font-black text-[#0f0f0f] leading-snug">Engagement Quality</h4>
                          <p className="text-[11px] text-[#606060] font-medium mt-1 leading-relaxed">
                            Calculated emotional resonance based on views, likes, and comment volume.
                          </p>
                        </div>
                        <div className="mt-4 relative z-10 flex items-center gap-2">
                          <div className="w-full bg-[#f0f0f0] h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#065fd4] h-full rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, (videoAnalytics?.engagementRate || 0) * 10)}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-[#065fd4] whitespace-nowrap">
                            {videoAnalytics?.engagementRate || 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white border border-[#f0f0f0] p-5 rounded-2xl text-left shadow-sm">
                        <span className="text-[9px] font-black text-[#909090] uppercase tracking-wider block mb-1">Views</span>
                        <h3 className="text-xl md:text-2xl font-black text-[#0f0f0f] tracking-tight">
                          {(videoAnalytics?.statistics?.viewCount || 0).toLocaleString()}
                        </h3>
                      </div>
                      <div className="bg-white border border-[#f0f0f0] p-5 rounded-2xl text-left shadow-sm">
                        <span className="text-[9px] font-black text-[#909090] uppercase tracking-wider block mb-1">Likes</span>
                        <h3 className="text-xl md:text-2xl font-black text-[#0f0f0f] tracking-tight">
                          {(videoAnalytics?.statistics?.likeCount || 0).toLocaleString()}
                        </h3>
                      </div>
                      <div className="bg-white border border-[#f0f0f0] p-5 rounded-2xl text-left shadow-sm">
                        <span className="text-[9px] font-black text-[#909090] uppercase tracking-wider block mb-1">Comments</span>
                        <h3 className="text-xl md:text-2xl font-black text-[#0f0f0f] tracking-tight">
                          {(videoAnalytics?.statistics?.commentCount || 0).toLocaleString()}
                        </h3>
                      </div>
                      <div className="bg-white border border-[#f0f0f0] p-5 rounded-2xl text-left shadow-sm">
                        <span className="text-[9px] font-black text-[#909090] uppercase tracking-wider block mb-1">Engagement</span>
                        <h3 className="text-xl md:text-2xl font-black text-[#0f0f0f] tracking-tight">
                          {videoAnalytics?.engagementRate || 0}%
                        </h3>
                      </div>
                    </div>

                    {/* Likes Growth Chart */}
                    <div className="bg-white border border-[#f0f0f0] p-5 rounded-2xl text-left shadow-sm">
                      <div className="mb-4">
                        <h4 className="text-sm font-black text-[#0f0f0f]">Likes growth over time</h4>
                        <p className="text-[10px] font-bold text-[#909090] uppercase tracking-wider mt-0.5">Historical engagement analysis</p>
                      </div>
                      <div className="h-[220px] w-full">
                        {videoAnalytics?.likesHistory && videoAnalytics.likesHistory.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={videoAnalytics.likesHistory}>
                              <defs>
                                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={formatChartDate} 
                                tick={{ fontSize: 10, fill: '#909090', fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis 
                                tick={{ fontSize: 10, fill: '#909090', fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip 
                                labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                contentStyle={{ 
                                  borderRadius: '12px', border: 'none', 
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)', padding: '10px 14px'
                                }}
                                itemStyle={{ fontWeight: '800', fontSize: '11px', color: '#22c55e' }}
                              />
                              <Area type="monotone" dataKey="likeCount" stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLikes)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-[#909090] font-bold italic">
                            Awaiting metrics history sync...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideosList;
