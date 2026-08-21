import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  PlaySquare,
  MessageSquare,
  Clock,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ThumbsUp,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
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

const formatChartDate = (dateStr) => {
  try {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
};

const getCleanThumbnail = (video) => {
  if (!video) return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&auto=format&fit=crop&q=60';
  let thumb = video.thumbnail || '';
  if (!thumb && video.videoId) {
    return `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
  }
  if (thumb.includes('_live')) {
    thumb = thumb.replace(/_live/gi, '');
  }
  if (thumb.includes('/mqdefault')) {
    thumb = thumb.replace(/\/mqdefault/g, '/hqdefault');
  }
  return thumb || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&auto=format&fit=crop&q=60';
};

const parseISO8601Duration = (durationStr) => {
  if (!durationStr) return { seconds: 0, formatted: '--:--' };
  
  const str = String(durationStr).trim();

  // 1. Check MM:SS or HH:MM:SS format (e.g. "0:45", "00:59", "1:30:00")
  if (str.includes(':')) {
    const parts = str.split(':').map(p => parseInt(p, 10) || 0);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return { seconds, formatted: str };
  }

  // 2. Check pure numbers (e.g. 45 or "45")
  if (!isNaN(str) && Number(str) > 0) {
    const totalSec = Math.floor(Number(str));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    return { seconds: totalSec, formatted };
  }

  // 3. Check ISO 8601 PT... format (case-insensitive e.g. "PT45S", "pt1m15s")
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i;
  const matches = str.match(regex);
  if (matches) {
    const hours = parseInt(matches[1] || 0, 10);
    const minutes = parseInt(matches[2] || 0, 10);
    const seconds = parseInt(matches[3] || 0, 10);
    const totalSec = hours * 3600 + minutes * 60 + seconds;
    let formatted = '';
    if (hours > 0) {
      formatted += `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else {
      formatted += `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return { seconds: totalSec, formatted };
  }

  return { seconds: 0, formatted: str };
};

const DEFAULT_VIDEO_THUMBNAIL = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&auto=format&fit=crop&q=60';

const ThumbnailImage = ({ initialSrc, videoId, alt, className }) => {
  const getCleanSrc = (url, vId) => {
    if (url && typeof url === 'string' && url.trim().length > 0) {
      let clean = url.replace(/_live/gi, '');
      if (clean.includes('/mqdefault')) {
        clean = clean.replace(/\/mqdefault/g, '/hqdefault');
      }
      return clean;
    }
    if (vId) {
      return `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;
    }
    return DEFAULT_VIDEO_THUMBNAIL;
  };

  const [src, setSrc] = useState(() => getCleanSrc(initialSrc, videoId));
  const [errorStage, setErrorStage] = useState(0);

  useEffect(() => {
    setSrc(getCleanSrc(initialSrc, videoId));
    setErrorStage(0);
  }, [initialSrc, videoId]);

  const handleError = () => {
    if (errorStage === 0) {
      setErrorStage(1);
      if (src && src.includes('/mqdefault')) {
        setSrc(src.replace('/mqdefault', '/hqdefault'));
      } else if (videoId) {
        setSrc(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
      } else {
        setErrorStage(2);
        setSrc(DEFAULT_VIDEO_THUMBNAIL);
      }
    } else if (errorStage === 1) {
      setErrorStage(2);
      if (src && !src.includes('/default.jpg')) {
        setSrc(src.replace(/\/hqdefault|\/mqdefault|\/sddefault|\/maxresdefault/, '/default'));
      } else {
        setSrc(DEFAULT_VIDEO_THUMBNAIL);
      }
    } else {
      setSrc(DEFAULT_VIDEO_THUMBNAIL);
    }
  };

  return (
    <img
      src={src}
      alt={alt || 'Thumbnail'}
      className={className}
      onError={handleError}
    />
  );
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
  const [isMobileDetail, setIsMobileDetail] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const processedVideos = (videos || []).map(v => {
    const isPost = Boolean(v.isPost || v.duration === 'Post' || v.videoId?.startsWith('yt_post_'));
    if (isPost) {
      return { ...v, isPost: true, durationSeconds: 0, formattedDuration: '' };
    }
    const { seconds, formatted } = parseISO8601Duration(v.duration);
    return {
      ...v,
      isPost: false,
      durationSeconds: seconds,
      formattedDuration: v.duration ? formatted : '--:--'
    };
  });

  const isShortVideo = (video) => {
    if (video.isPost) return false;
    if (video.isShort || video.type === 'short') return true;
    if (typeof video.durationSeconds === 'number' && video.durationSeconds > 0) {
      return video.durationSeconds <= 60;
    }
    const text = `${video.title || ''} ${video.description || ''} ${video.url || ''}`.toLowerCase();
    return text.includes('#shorts') || text.includes('/shorts/') || text.includes('short');
  };

  const isLiveVideo = (video) => {
    if (video.isPost) return false;
    const titleUpper = String(video.title || '').trim().toUpperCase();
    const isLiveTitle = titleUpper.startsWith('LIVE |') ||
      titleUpper.startsWith('LIVE:') ||
      titleUpper.startsWith('[LIVE]') ||
      titleUpper.startsWith('LIVE -') ||
      titleUpper.includes('LIVE STREAM') ||
      titleUpper.includes('STREAMED LIVE') ||
      titleUpper.includes('WAS LIVE');

    return Boolean(
      video.isLive || 
      video.liveChatId || 
      video.isLiveStream ||
      video.liveBroadcastContent === 'live' || 
      video.liveBroadcastContent === 'upcoming' ||
      video.liveBroadcastContent === 'completed' ||
      isLiveTitle
    );
  };

  const liveVideos = processedVideos.filter(isLiveVideo).sort((a, b) => {
    const aIsActive = Boolean(a.isLive || a.liveBroadcastContent === 'live');
    const bIsActive = Boolean(b.isLive || b.liveBroadcastContent === 'live');
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;
    return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
  });

  const shortVideos = processedVideos.filter(v => !isLiveVideo(v) && isShortVideo(v));
  const longVideos = processedVideos.filter(v => !isLiveVideo(v) && !v.isPost && !isShortVideo(v));
  const communityPosts = processedVideos.filter(v => v.isPost);

  const activeVideosList = videoTab === 'videos' 
    ? longVideos 
    : (videoTab === 'shorts' 
      ? shortVideos 
      : (videoTab === 'live' 
        ? liveVideos 
        : communityPosts));
  const selectedVideoData = processedVideos.find(v => v.videoId === selectedVideo);

  useEffect(() => {
    if (activeVideosList.length > 0) {
      const isCurrentSelectedInTab = activeVideosList.some(v => v.videoId === selectedVideo);
      if (!isCurrentSelectedInTab) {
        handleVideoSelect(activeVideosList[0].videoId, isMobileViewport);
      }
    } else {
      if (videoTab === 'videos' && longVideos.length === 0) {
        if (shortVideos.length > 0) setVideoTab('shorts');
        else if (liveVideos.length > 0) setVideoTab('live');
        else if (communityPosts.length > 0) setVideoTab('posts');
      } else if (videoTab === 'shorts' && shortVideos.length === 0) {
        if (longVideos.length > 0) setVideoTab('videos');
        else if (liveVideos.length > 0) setVideoTab('live');
        else if (communityPosts.length > 0) setVideoTab('posts');
      } else if (videoTab === 'live' && liveVideos.length === 0) {
        if (longVideos.length > 0) setVideoTab('videos');
        else if (shortVideos.length > 0) setVideoTab('shorts');
        else if (communityPosts.length > 0) setVideoTab('posts');
      } else if (videoTab === 'posts' && communityPosts.length === 0) {
        if (longVideos.length > 0) setVideoTab('videos');
        else if (shortVideos.length > 0) setVideoTab('shorts');
        else if (liveVideos.length > 0) setVideoTab('live');
      } else {
        setSelectedVideo(null);
        setComments([]);
        setVideoAnalytics(null);
        setIsMobileDetail(false);
      }
    }
  }, [videoTab, videos, isMobileViewport]);

  useEffect(() => {
    setIsMobileDetail(false);
  }, [videoTab, channelId]);

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
      const [videosRes, liveRes] = await Promise.allSettled([
        api.get('/youtube/videos', { params: { channelId } }),
        api.get('/live-chat/streams', { params: { channelId } })
      ]);

      const fetchedVideos = videosRes.status === 'fulfilled' && Array.isArray(videosRes.value.data)
        ? videosRes.value.data
        : (videosRes.status === 'fulfilled' && videosRes.value.data && Array.isArray(videosRes.value.data.videos))
          ? videosRes.value.data.videos
          : [];

      const fetchedLive = liveRes.status === 'fulfilled' && liveRes.value.data && Array.isArray(liveRes.value.data.streams)
        ? liveRes.value.data.streams
        : [];

      // Merge videos and live streams cleanly without duplicates
      const byVideoId = new Map();
      [...fetchedVideos, ...fetchedLive].forEach(item => {
        if (!item?.videoId) return;
        const previous = byVideoId.get(item.videoId) || {};
        byVideoId.set(item.videoId, {
          ...previous,
          ...item,
          isLive: Boolean(previous.isLive || item.isLive || item.liveChatId || item.liveBroadcastContent === 'live'),
          liveBroadcastContent: item.liveBroadcastContent || previous.liveBroadcastContent || 'none',
          liveChatId: item.liveChatId || previous.liveChatId || ''
        });
      });

      const mergedVideos = Array.from(byVideoId.values());
      setVideos(mergedVideos);

      if (mergedVideos.length > 0 && !selectedVideo) {
        const isCurrentSelectedInList = mergedVideos.some(v => v.videoId === selectedVideo);
        if (!isCurrentSelectedInList) {
          handleVideoSelect(mergedVideos[0].videoId, isMobileViewport);
        }
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleVideoSelect = async (videoId, openDetail = true) => {
    try {
      setSelectedVideo(videoId);
      if (openDetail && isMobileViewport) setIsMobileDetail(true);
      setLoadingComments(true);
      setLoadingAnalytics(true);

      const currentVideo = processedVideos.find(v => v.videoId === videoId);
      const isLive = currentVideo ? isLiveVideo(currentVideo) : false;

      let commentsData = [];
      let analyticsData = null;

      if (isLive && currentVideo?.liveChatId) {
        try {
          const liveChatRes = await api.get('/live-chat/messages', {
            params: { channelId: currentVideo?.channelId || channelId, liveChatId: currentVideo.liveChatId }
          });
          const messages = liveChatRes.data?.messages || [];
          commentsData = messages.map(m => ({
            _id: m._id || m.messageId,
            youtubeId: m.messageId,
            videoId: videoId,
            author: m.authorName || 'Anonymous',
            authorProfileImageUrl: m.authorProfileImageUrl,
            text: m.messageText,
            publishedAt: m.publishedAt,
            sentiment: m.senderType === 'toxic' ? 'toxic' : 'positive',
            replyText: m.isBotReply ? m.messageText : null,
            replyStatus: m.senderType === 'bot' ? 'sent' : null,
            isLiveChat: true
          }));
        } catch (err) {
          console.error('Error fetching live chat messages:', err);
        }
      }

      if (commentsData.length === 0) {
        const targetChannelId = currentVideo?.channelId || channelId;
        let [commentsRes, historyRes] = await Promise.allSettled([
          api.get('/comments', { params: { videoId, channelId: targetChannelId } }),
          api.get('/comment-history', { params: { channelId: targetChannelId, limit: 100 } })
        ]);

        let dbComments = commentsRes.status === 'fulfilled'
          ? (Array.isArray(commentsRes.value.data) ? commentsRes.value.data : (commentsRes.value.data?.comments || []))
          : [];

        // If no comments in DB for this video, auto-sync comments from YouTube Data API
        if (dbComments.length === 0 && !isLive) {
          try {
            await api.get(`/comments/analyze/${videoId}`, { params: { channelId: targetChannelId } });
            const reFetch = await api.get('/comments', { params: { videoId, channelId: targetChannelId } });
            if (reFetch.data) {
              dbComments = Array.isArray(reFetch.data) ? reFetch.data : (reFetch.data.comments || []);
            }
          } catch (syncErr) {
            console.warn('Auto sync for video comments:', syncErr);
          }
        }

        const historyItems = historyRes.status === 'fulfilled' && historyRes.value.data?.items
          ? historyRes.value.data.items
          : [];

        // Convert history items for this video into normalized comment objects
        const videoHistoryComments = historyItems
          .filter(h => (h.videoId && h.videoId === videoId) || (h.videoTitle && currentVideo?.title && h.videoTitle === currentVideo.title))
          .map(h => ({
            _id: h.id,
            youtubeId: h.id,
            videoId: videoId,
            author: h.authorName || 'Anonymous',
            text: h.commentText || '',
            replyText: h.replyText || null,
            status: h.type === 'deleted' ? 'deleted' : (h.type === 'hidden' ? 'flagged' : 'approved'),
            sentiment: h.category || 'positive',
            publishedAt: h.actionDate,
            hasReplied: h.type === 'replied',
            replyStatus: h.type === 'replied' ? 'sent' : null,
            isBotHistoryRecord: true
          }));

        // Deduplicate merged comments
        const mergedMap = new Map();
        [...dbComments, ...videoHistoryComments].forEach(c => {
          const key = c.youtubeId || c._id;
          if (!mergedMap.has(key)) {
            mergedMap.set(key, c);
          } else {
            const existing = mergedMap.get(key);
            mergedMap.set(key, { ...existing, ...c, replyText: c.replyText || existing.replyText });
          }
        });
        commentsData = Array.from(mergedMap.values());
      }

      try {
        const analyticsRes = await api.get(`/youtube/video/${videoId}/analytics`);
        analyticsData = analyticsRes.data?.video || null;
      } catch (err) {
        console.error('Error fetching video analytics:', err);
      }

      setComments(commentsData);
      setVideoAnalytics(analyticsData);
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
      console.error(`Action failed: ${errorMsg}`);
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

  const isBotActedComment = (c) => {
    if (!c) return false;
    return Boolean(
      c.hasReplied ||
      (c.replyText && c.replyText.trim().length > 0) ||
      c.replyStatus === 'sent' ||
      c.autoLiked ||
      c.isModerated ||
      c.aiActionTaken ||
      (c.status && ['approved', 'deleted', 'flagged', 'moderate'].includes(c.status)) ||
      c.moderationAction ||
      c.actionTaken ||
      c.deleteReason ||
      c.moderationReason ||
      c.isBotHistoryRecord
    );
  };

  const getCommentCategory = (c) => {
    if (!c) return 'moderate';
    const sent = String(c.sentiment || c.classification || '').toLowerCase().trim();
    if (sent === 'positive') return 'positive';
    if (['toxic', 'spam', 'hate', 'abuse', 'threat', 'scam'].includes(sent)) return 'toxic';
    return 'moderate';
  };

  // Use useMemo so counts & filtered list always recompute when comments or filter changes
  const processedVideoComments = useMemo(() => {
    return comments.filter(c => {
      if (!c) return false;
      if (c.isBotReply) return false;
      if (c.youtubeId && String(c.youtubeId).includes('.')) return false;
      return true;
    });
  }, [comments]);

  const filteredComments = useMemo(() => {
    if (filter === 'all') return processedVideoComments;
    return processedVideoComments.filter(c => getCommentCategory(c) === filter);
  }, [processedVideoComments, filter]);

  const commentCounts = useMemo(() => ({
    all: processedVideoComments.length,
    positive: processedVideoComments.filter(c => getCommentCategory(c) === 'positive').length,
    toxic: processedVideoComments.filter(c => getCommentCategory(c) === 'toxic').length,
    moderate: processedVideoComments.filter(c => getCommentCategory(c) === 'moderate').length,
  }), [processedVideoComments]);

  const getStatsForFilter = (type) => commentCounts[type] ?? 0;

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
    <div className={`flex flex-col md:flex-row lg:h-full w-full ${isEmbedded ? 'gap-2 lg:gap-4 bg-[#f9f9f9]' : 'gap-4 md:gap-5 lg:gap-6'} overflow-visible lg:overflow-hidden`}>
      {/* Left Pane: Videos List */}
      <div className={`${isMobileDetail ? 'hidden md:flex' : 'flex'} w-full md:w-[280px] lg:w-[320px] flex-col gap-4 shrink-0 h-[calc(100vh-220px)] min-h-[420px] md:h-full overflow-hidden`}>
        <div className={`yt-card !p-0 flex flex-col h-full overflow-hidden ${isEmbedded ? '!rounded-none !border-y-0 !border-l-0 !shadow-none' : ''}`}>
          <div className="p-4 md:p-5 border-b border-[#e5e5e5] flex items-center justify-between bg-white sticky top-0 z-10 ">
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
              <button onClick={fetchVideos} className="h-11 w-11 flex items-center justify-center hover:bg-[#f2f2f2] rounded-full text-[#909090] transition-colors" title="Refresh videos">
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
          <div className="px-1 py-2 border-b border-[#e5e5e5] bg-[#f2f2f2] grid grid-cols-4 gap-0.5">
            <button
              onClick={() => setVideoTab('videos')}
              className={`min-h-[40px] px-0.5 py-1.5 flex items-center justify-center gap-0.5 text-[8.5px] min-[360px]:text-[9px] sm:text-[10px] font-black uppercase tracking-tight rounded-xl transition-all border text-center whitespace-nowrap overflow-hidden ${videoTab === 'videos'
                  ? 'bg-[#fff1f1] text-[#ff0000] border-red-100 shadow-sm'
                  : 'text-[#909090] hover:text-[#0f0f0f] border-transparent'
                }`}
              title={`Videos (${longVideos.length})`}
            >
              <span>Videos</span>
              <span>({longVideos.length})</span>
            </button>
            <button
              onClick={() => setVideoTab('shorts')}
              className={`min-h-[40px] px-0.5 py-1.5 flex items-center justify-center gap-0.5 text-[8.5px] min-[360px]:text-[9px] sm:text-[10px] font-black uppercase tracking-tight rounded-xl transition-all border text-center whitespace-nowrap overflow-hidden ${videoTab === 'shorts'
                  ? 'bg-[#fff1f1] text-[#ff0000] border-red-100 shadow-sm'
                  : 'text-[#909090] hover:text-[#0f0f0f] border-transparent'
                }`}
              title={`Shorts (${shortVideos.length})`}
            >
              <span>Shorts</span>
              <span>({shortVideos.length})</span>
            </button>
            <button
              onClick={() => setVideoTab('live')}
              className={`min-h-[40px] px-0.5 py-1.5 flex items-center justify-center gap-0.5 text-[8.5px] min-[360px]:text-[9px] sm:text-[10px] font-black uppercase tracking-tight rounded-xl transition-all border text-center whitespace-nowrap overflow-hidden ${videoTab === 'live'
                  ? 'bg-[#fff1f1] text-[#ff0000] border-red-100 shadow-sm'
                  : 'text-[#909090] hover:text-[#0f0f0f] border-transparent'
                }`}
              title={`Live (${liveVideos.length})`}
            >
              <span>Live</span>
              <span>({liveVideos.length})</span>
            </button>
            <button
              onClick={() => setVideoTab('posts')}
              className={`min-h-[40px] px-0.5 py-1.5 flex items-center justify-center gap-0.5 text-[8.5px] min-[360px]:text-[9px] sm:text-[10px] font-black uppercase tracking-tight rounded-xl transition-all border text-center whitespace-nowrap overflow-hidden ${videoTab === 'posts'
                  ? 'bg-[#fff1f1] text-[#ff0000] border-red-100 shadow-sm'
                  : 'text-[#909090] hover:text-[#0f0f0f] border-transparent'
                }`}
              title={`Posts (${communityPosts.length})`}
            >
              <span>Posts</span>
              <span>({communityPosts.length})</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll p-2" onScroll={handleVideoListScroll}>
            {activeVideosList.slice(0, displayLimit).map((video) => (
              <button
                key={video.videoId}
                onClick={() => handleVideoSelect(video.videoId)}
                className={`w-full min-h-[72px] flex gap-3 p-3 rounded-2xl transition-all text-left mb-1.5 border group items-center ${selectedVideo === video.videoId ? 'bg-[#fff1f1] border-red-100 text-[#ff0000] shadow-sm' : 'hover:bg-slate-50 border-transparent text-slate-500'
                  }`}
              >
                <div className="relative flex-shrink-0 w-20 h-12 rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                  <ThumbnailImage
                    initialSrc={getCleanThumbnail(video)}
                    videoId={video.videoId}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {video.isPost ? (
                    <span className="absolute bottom-1 right-1 bg-[#ff0000]/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      POST
                    </span>
                  ) : isLiveVideo(video) ? (
                    <span className="absolute bottom-1 right-1 bg-[#ff0000] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                  ) : (
                    <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      {video.formattedDuration}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
                  <h4 className={`text-[12px] font-black line-clamp-1 group-hover:text-slate-900 transition-colors leading-snug ${selectedVideo === video.videoId ? 'text-[#ff0000]' : 'text-slate-900'}`}>
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
                      console.log(`Video Audit Details:\n- Video ID: ${video.videoId}\n- Title: ${video.title}`);
                    }}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <MoreVertical size={16} />
                  </span>
                  {selectedVideo === video.videoId && <ChevronRight size={16} className="text-[#ff0000] hidden md:block" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane: Analysis & Comments */}
      <div className={`${isMobileDetail || selectedVideo ? 'flex' : 'hidden md:flex'} flex-1 flex-col gap-4 lg:overflow-hidden h-auto md:h-full`}>
        <div className={`yt-card !p-0 flex flex-col h-auto lg:h-full overflow-visible lg:overflow-hidden ${isEmbedded ? '!rounded-none !border-y-0 !border-l-0 !shadow-none' : ''}`}>
          {/* Header & Panel Tabs */}
          <div className="p-4 md:p-6 border-b border-[#e5e5e5] bg-white sticky top-0 z-20 ">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <button type="button" onClick={() => setIsMobileDetail(false)} className="md:hidden h-11 w-11 rounded-2xl border border-[#e5e5e5] bg-white text-[#0f0f0f] flex items-center justify-center shrink-0" title="Back to videos">
                  <ChevronLeft size={20} />
                </button>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-black text-[#0f0f0f] tracking-tight truncate">Video Workspace</h3>
                  <p className="text-[11px] md:text-xs text-[#909090] font-medium mt-1">Analyze and moderate your content</p>
                </div>
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
                  className="h-11 w-11 flex items-center justify-center bg-white border border-[#e5e5e5] rounded-xl hover:bg-white transition-colors shrink-0"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
            {/* Tab Toggle buttons */}
            <div className="flex gap-1.5 sm:gap-2 border-b border-[#e5e5e5] pb-3 mb-3">
              <button
                onClick={() => setActivePanelTab('comments')}
                className={`flex-1 min-h-[40px] sm:min-h-[44px] py-2 px-2 sm:px-4 text-[10.5px] min-[360px]:text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all border text-center flex items-center justify-center ${activePanelTab === 'comments'
                    ? 'bg-[#fff1f1] text-[#ff0000] border-red-100 shadow-sm'
                    : 'text-[#909090] hover:text-[#0f0f0f] bg-white border-transparent hover:bg-white'
                  }`}
              >
                <span className="hidden sm:inline">Comments & Moderation</span>
                <span className="sm:hidden">Moderation</span>
              </button>
              <button
                onClick={() => setActivePanelTab('analytics')}
                className={`flex-1 min-h-[40px] sm:min-h-[44px] py-2 px-2 sm:px-4 text-[10.5px] min-[360px]:text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all border text-center flex items-center justify-center ${activePanelTab === 'analytics'
                    ? 'bg-[#fff1f1] text-[#ff0000] border-red-100 shadow-sm'
                    : 'text-[#909090] hover:text-[#0f0f0f] bg-white border-transparent hover:bg-white'
                  }`}
              >
                <span className="hidden sm:inline">Dashboard & Analytics</span>
                <span className="sm:hidden">Dashboard</span>
              </button>
            </div>

            {/* Comment Filters (only visible when comments tab is active) */}
            {activePanelTab === 'comments' && (
              <div className="flex gap-1 sm:gap-2 justify-between overflow-x-auto no-scrollbar pb-1">
                {filters.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`flex-1 min-w-[65px] sm:min-w-0 min-h-[38px] sm:min-h-[44px] flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all border ${filter === f.id ? 'bg-[#ff0000] text-white border-white/20 shadow-md scale-[1.02]' : `bg-white border-[#e5e5e5] ${f.color.split(' ')[1]} hover:bg-white hover:border-[#d9d9d9]`
                      }`}
                  >
                    <span className="whitespace-nowrap">{f.label}</span>
                    <span className={`px-1 py-0.5 rounded-md text-[9px] sm:text-[10px] ${filter === f.id ? 'bg-white text-[#ff0000]' : 'bg-white text-[#606060]'}`}>
                      {getStatsForFilter(f.id)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conditional Content Rendering */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll p-3 md:p-6 bg-white" onScroll={handleCommentsScroll}>
            {selectedVideoData && selectedVideoData.isPost ? (
              <div className="max-w-[900px] mx-auto mb-6 p-6 bg-white border border-[#e5e5e5] rounded-2xl shadow-md text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white flex items-center justify-center font-black">
                    CB
                  </div>
                  <div>
                    <h4 className="font-black text-[#0f0f0f] text-sm">ChannelBot</h4>
                    <p className="text-[11px] text-[#909090] font-bold uppercase tracking-wider">
                      Community Post • {safeFormatDistanceToNow(selectedVideoData.publishedAt)} ago
                    </p>
                  </div>
                </div>
                {selectedVideoData.title && (
                  <p className="text-[15px] text-[#0f0f0f] leading-relaxed font-bold mb-3 whitespace-pre-wrap">
                    {selectedVideoData.title}
                  </p>
                )}
                {selectedVideoData.description && selectedVideoData.description !== selectedVideoData.title && (
                  <p className="text-[13px] text-[#606060] leading-relaxed font-medium mb-4 whitespace-pre-wrap">
                    {selectedVideoData.description}
                  </p>
                )}
                {selectedVideoData.thumbnail && (
                  <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-2 flex justify-center items-center overflow-hidden">
                    <ThumbnailImage
                      initialSrc={selectedVideoData.thumbnail}
                      videoId={selectedVideoData.videoId}
                      alt="Post Attachment"
                      className="w-full max-h-[480px] object-contain rounded-xl"
                    />
                  </div>
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
            {!selectedVideo ? (
              <div className="h-full flex flex-col items-center justify-center text-[#909090] py-16 text-center">
                <PlaySquare size={48} className="mb-4 text-[#909090]" />
                <p className="text-base md:text-lg font-bold text-[#0f0f0f]">No Video Selected</p>
                <p className="text-xs text-[#909090] max-w-[320px] mt-1 font-medium leading-relaxed">
                  Select a video or short from the list on the left to analyze its specific comments and video analytics.
                </p>
              </div>
            ) : activePanelTab === 'comments' ? (
              // Comments Tab Content
              loadingComments ? (
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
                              src={comment.authorProfileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author || 'User')}&background=random`}
                              className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-[#f0f0f0]"
                              alt=""
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author || 'User')}&background=random`;
                              }}
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
                              <div className="mt-4 ml-4 md:ml-6 pl-4 border-l-2 border-red-200 space-y-3 bg-[#fff1f1] p-3 rounded-2xl border border-red-100 text-left">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#fff1f1] flex items-center justify-center text-[#ff0000] text-[10px] font-bold">
                                      AI
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-extrabold text-[11px] md:text-xs text-[#0f0f0f]">Channel Owner (AI Auto-Reply)</span>
                                      <span className="text-[9px] font-black uppercase bg-[#ff0000]/10 text-[#ff0000] px-1.5 py-0.5 rounded-md border border-red-100 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-[#ff0000] animate-pulse" />
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
                                <p className="text-[12px] md:text-[13px] text-[#333] font-medium leading-relaxed bg-white p-3 rounded-xl border border-[#e5e5e5]">
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
                              <div className="mt-4 ml-4 md:ml-6 pl-4 border-l-2 border-red-500/30 space-y-2 bg-[#fff1f1]/50 p-3 rounded-2xl border border-red-500/10 text-left">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-[#fff1f1] flex items-center justify-center text-[#ff0000] text-[10px] font-bold">
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
                                    className={`flex items-center gap-1.5 hover:text-[#ff0000] transition-colors text-[11px] md:text-xs font-bold ${processingId === comment._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    {processingId === comment._id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={14} />}
                                    <span className="hidden xs:inline">Approve</span>
                                  </button>
                                  <button
                                    onClick={() => handleAction(comment._id, 'like')}
                                    disabled={processingId === comment._id || comment.autoLiked || comment.likeStatus === 'not_supported'}
                                    className={`flex items-center gap-1.5 hover:text-[#ff0000] transition-colors text-[11px] md:text-xs font-bold ${processingId === comment._id || comment.autoLiked || comment.likeStatus === 'not_supported' ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  <Loader2 className="animate-spin text-[#ff0000]" size={32} />
                  <p className="text-[11px] md:text-sm font-bold uppercase tracking-widest">Loading Analytics...</p>
                </div>
              ) : !videoAnalytics ? (
                <div className="h-full flex flex-col items-center justify-center text-[#909090] opacity-50 py-12">
                  <RefreshCw size={48} className="mb-4 animate-spin text-[#ff0000]" />
                  <p className="text-base md:text-lg font-bold">Synchronizing Video Statistics...</p>
                </div>
              ) : (
                <div className="space-y-6 max-w-[900px] mx-auto text-left">
                  {/* Interactive Widgets Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Like Tracking Widget */}
                    <div className="bg-[#f0fdf4] border border-[#ff0000]/10 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#ff0000]/5 rounded-full blur-xl group-hover:scale-125 transition-all duration-500" />
                      <div className="relative z-10">
                        <span className="text-[10px] font-black text-[#ff0000] uppercase tracking-wider block mb-1">Interactive Action</span>
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
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${isAlreadyLiked
                                    ? 'bg-[#fff1f1] text-[#ff0000] border border-red-100 cursor-default animate-none'
                                    : submittingLike
                                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                      : 'bg-[#ff0000] text-white hover:bg-[#cc0000] hover:scale-[1.03] shadow-md hover:shadow-lg'
                                  }`}
                              >
                                {submittingLike ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <ThumbsUp size={14} className={isAlreadyLiked ? 'fill-[#ff0000]' : ''} />
                                )}
                                <span>{isAlreadyLiked ? 'Liked on Dashboard' : submittingLike ? 'Submitting...' : 'Like Video'}</span>
                              </button>
                              {isAlreadyLiked && (
                                <span className="text-[10px] font-bold text-[#ff0000] italic">Duplicate prevented</span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Engagement Widget */}
                    <div className="bg-white border border-[#f0f0f0] p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#fff1f1] rounded-full blur-xl group-hover:scale-125 transition-all duration-500" />
                      <div className="relative z-10">
                        <span className="text-[10px] font-black text-[#ff0000] uppercase tracking-wider block mb-1">Performance Meter</span>
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
                        <span className="text-xs font-black text-[#ff0000] whitespace-nowrap">
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
                                <stop offset="5%" stopColor="#ff0000" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#ff0000" stopOpacity={0} />
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
                              itemStyle={{ fontWeight: '800', fontSize: '11px', color: '#ff0000' }}
                            />
                            <Area type="monotone" dataKey="likeCount" stroke="#ff0000" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLikes)" />
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
