import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { 
  ThumbsUp, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  ExternalLink,
  Loader2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Heart,
  MoreVertical,
  Zap,
  Languages,
  Eye,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { getSentimentConfig } from '../utils/constants/sentimentColors.js';

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

const ModerationQueue = ({ onAction, searchQuery }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ sentiment: '', status: '', note: '' });
  const [filter, setFilter] = useState('all');

  const [displayLimit, setDisplayLimit] = useState(50);

  useEffect(() => {
    setDisplayLimit(50);
  }, [filter, comments]);

  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150) {
        setDisplayLimit(prev => Math.min(comments.length, prev + 50));
      }
    };

    window.addEventListener('scroll', handleWindowScroll);
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [comments.length]);

  useEffect(() => {
    fetchComments();

    const socket = getSocket();
    socket.on('stats_updated', fetchComments);
    socket.on('new_comment_analyzed', fetchComments);
    
    return () => {
      socket.off('stats_updated', fetchComments);
      socket.off('new_comment_analyzed', fetchComments);
    };
  }, [filter]);

  const fetchComments = async () => {
    try {
      const res = await api.get('/comments', {
        params: {
          sentiment: filter !== 'all' && ['positive', 'neutral', 'moderate', 'toxic'].includes(filter) ? filter : undefined,
          status: filter === 'deleted' ? 'deleted' : (filter === 'liked' ? undefined : undefined),
          autoLiked: filter === 'liked' ? true : undefined
        }
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.comments || []);
      setComments(data.filter(c => !c.isBotReply && !(c.youtubeId && c.youtubeId.includes('.'))));
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.post(`/comments/${id}/action`, { action });
      fetchComments();
      if (onAction) onAction();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment._id);
    setEditForm({
      sentiment: comment.sentiment,
      status: comment.status,
      note: comment.note || ''
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/comments/${id}/edit`, editForm);
      setEditingId(null);
      fetchComments();
      if (onAction) onAction();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading) return (
    <div className="h-[400px] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-[#ff0000]" size={48} />
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#ff0000] opacity-20" size={20} />
      </div>
      <p className="text-xs font-black text-[#909090] uppercase tracking-[0.2em] animate-pulse">Syncing Cloud Audit...</p>
    </div>
  );

  const filters = [
    { id: 'all', label: 'Global Feed' },
    { id: 'toxic', label: 'Toxic', dot: '#d93025' },
    { id: 'moderate', label: 'Moderate', dot: '#f9ab00' },
    { id: 'neutral', label: 'Neutral', dot: '#909090' },
    { id: 'positive', label: 'Positive', dot: '#2ba640' },
    { id: 'deleted', label: 'Vanished' },
    { id: 'liked', label: 'Appreciated' }
  ];

  return (
    <div className="flex flex-col">
      {/* Premium Filters Bar */}
      <div className="flex items-center gap-3 p-6 bg-white/20 border-b border-white/40 backdrop-blur-xl overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-2 mr-4 shrink-0">
           <Zap size={16} className="text-[#ff0000]" />
           <span className="text-[11px] font-black uppercase tracking-widest text-[#0f0f0f]">Auditor Context</span>
        </div>
        <div className="flex items-center gap-2">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setLoading(true); }}
              className={`px-5 py-2 rounded-2xl text-[12px] font-black transition-all border whitespace-nowrap flex items-center gap-2 ${
                filter === f.id 
                  ? 'bg-gradient-to-r from-red-600/15 to-red-500/5 text-red-650 border-red-500/20 shadow-sm shadow-red-500/5' 
                  : 'bg-white/40 text-[#606060] border-white/50 hover:bg-white/60 hover:text-[#0f0f0f]'
              }`}
            >
              {f.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.dot }} />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar glass-panel rounded-3xl mt-6 border-white/50">
        <table className="w-full border-separate border-spacing-0 min-w-[1000px]">
          <thead>
            <tr className="bg-white/40">
              <th className="text-left py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-white/30 backdrop-blur-md">Author & Intelligence</th>
              <th className="text-left py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-white/30 backdrop-blur-md">Evaluation</th>
              <th className="text-left py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-white/30 backdrop-blur-md">AI Status</th>
              <th className="text-right py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-white/30 backdrop-blur-md">Audit Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white/20">
            <AnimatePresence mode="popLayout">
              {comments.length === 0 ? (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td colSpan="4" className="text-center py-32">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                       <ShieldCheck size={48} className="text-[#909090]" />
                       <p className="text-sm font-black uppercase tracking-widest text-[#909090]">Clear Skies. No Data Pending.</p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                comments
                  .filter(c => c.text.toLowerCase().includes((searchQuery || '').toLowerCase()) || c.author.toLowerCase().includes((searchQuery || '').toLowerCase()))
                  .slice(0, displayLimit)
                  .map((comment, i) => (
                  <motion.tr 
                    key={comment._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`group transition-all hover:bg-white/40 border-b border-white/20 ${editingId === comment._id ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="py-6 px-6 align-top">
                      <div className="flex gap-5">
                        <div className="relative shrink-0">
                          <img 
                            src={comment.authorProfileImageUrl || `https://ui-avatars.com/api/?name=${comment.author}&background=f0f0f0&color=606060`} 
                            className="w-12 h-12 rounded-[20px] border-2 border-white shadow-sm ring-1 ring-[#f0f0f0] group-hover:ring-[#ff0000]/20 transition-all" 
                            alt=""
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border border-[#f0f0f0] flex items-center justify-center text-[10px] font-black">
                             {i + 1}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[14px] font-black text-[#0f0f0f] tracking-tight hover:text-[#ff0000] cursor-pointer transition-colors">@{comment.author}</span>
                            <div className="flex items-center gap-1.5">
                              {comment.language && (
                                <span className="text-[9px] font-black uppercase bg-[#f8f9fa] text-[#909090] px-2 py-0.5 rounded-lg border border-[#f0f0f0] flex items-center gap-1">
                                  <Languages size={10} /> {comment.language}
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-[#aaaaaa] flex items-center gap-1">
                                <Clock size={10} /> {safeFormatDistanceToNow(comment.publishedAt)}
                              </span>
                            </div>
                          </div>
                          <p className="text-[13.5px] text-[#222] font-medium leading-relaxed mb-4 max-w-[500px]">"{comment.text}"</p>
                           
                           {comment.replyText && (comment.replyStatus === 'sent' || comment.hasReplied) && (
                             <div className="mt-3 ml-4 pl-4 border-l-2 border-red-500/30 space-y-2 bg-[#fff1f1]/50 p-3 rounded-2xl border border-red-500/10 text-left max-w-[500px]">
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                   <div className="w-5 h-5 rounded-full bg-[#fff1f1] flex items-center justify-center text-[#ff0000] text-[9px] font-bold">
                                     AI
                                   </div>
                                   <div className="flex items-center gap-1">
                                     <span className="font-extrabold text-[10px] text-[#0f0f0f]">Channel Owner (AI Auto-Reply)</span>
                                     <span className="text-[8px] font-black uppercase bg-[#fff1f1] text-[#ff0000] px-1.5 py-0.5 rounded-md border border-red-100 flex items-center gap-1">
                                       <span className="w-1 h-1 rounded-full bg-[#ff0000] animate-pulse" />
                                       DeepSeek Sent
                                     </span>
                                   </div>
                                 </div>
                               </div>
                               <p className="text-[11.5px] text-[#333] italic font-medium leading-relaxed bg-white/60 p-2.5 rounded-xl border border-white/80">
                                 "{comment.replyText}"
                               </p>
                             </div>
                           )}

                           {comment.replyStatus === 'failed' && (
                             <div className="mt-3 ml-4 pl-4 border-l-2 border-red-500/40 space-y-2 bg-red-50/20 p-3 rounded-2xl border border-red-500/10 text-left max-w-[500px]">
                               <div className="flex items-center gap-2">
                                 <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-[9px] font-bold">
                                   AI
                                 </div>
                                 <div className="flex items-center gap-1">
                                   <span className="font-extrabold text-[10px] text-[#0f0f0f]">Channel Owner (AI Auto-Reply)</span>
                                   <span className="text-[8px] font-black uppercase bg-[#d93025]/10 text-[#d93025] px-1.5 py-0.5 rounded-md border border-[#d93025]/20 flex items-center gap-1">
                                     <span className="w-1 h-1 rounded-full bg-[#d93025]" />
                                     Reply Failed
                                   </span>
                                 </div>
                               </div>
                               {comment.replyError && (
                                 <p className="text-[10px] text-[#c5221f] font-semibold">
                                   Error: {comment.replyError}
                                 </p>
                               )}
                             </div>
                           )}
                          
                          {comment.detectedWords && comment.detectedWords.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {comment.detectedWords.map((item, idx) => {
                                const cat = item.category?.toLowerCase();
                                const isPositive = ['appreciation', 'praise', 'greeting', 'support'].includes(cat);
                                const isNegative = ['abusive', 'toxic', 'insult', 'threat'].includes(cat);
                                
                                return (
                                  <span 
                                    key={idx} 
                                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 ${
                                      isPositive ? 'bg-[#fff1f1] text-[#ff0000] border-red-100' :
                                      isNegative ? 'bg-red-50 text-red-700 border-red-100' :
                                      'bg-[#f7f7f7] text-[#606060] border-[#e5e5e5]'
                                    }`}
                                  >
                                    <div className={`w-1 h-1 rounded-full ${isPositive ? 'bg-[#ff0000]' : isNegative ? 'bg-red-500' : 'bg-[#606060]'}`} />
                                    {item.word}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-6 px-6 align-top">
                      <div className="flex flex-col gap-4">
                        {editingId === comment._id ? (
                           <div className="relative group">
                            <select 
                              value={editForm.sentiment}
                              onChange={(e) => setEditForm({...editForm, sentiment: e.target.value})}
                              className="appearance-none text-[12px] font-black glass-input rounded-xl px-4 py-2.5 w-full outline-none"
                            >
                              <option value="positive">Positive</option>
                              <option value="neutral">Neutral</option>
                              <option value="moderate">Moderate</option>
                              <option value="toxic">Toxic</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#909090] pointer-events-none" />
                          </div>
                        ) : (
                          <span className={`yt-badge ${getSentimentConfig(comment.sentiment).badgeClass} px-3 py-1.5 rounded-xl border flex items-center justify-center gap-2 tracking-[0.1em] text-[10px] uppercase font-black`}>
                             <div className="w-1.5 h-1.5 rounded-full bg-current" />
                             {comment.sentiment}
                          </span>
                        )}

                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-[#909090] uppercase tracking-widest">Confidence</span>
                              <span className="text-[10px] font-black text-[#0f0f0f]">{Math.round((comment.confidence || 0) * 100)}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(comment.confidence || 0) * 100}%` }}
                              className="h-full rounded-full transition-all duration-1000" 
                              style={{ 
                                backgroundColor: getSentimentConfig(comment.sentiment).color
                              }}
                            />
                           </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-6 px-6 align-top">
                      {editingId === comment._id ? (
                        <select 
                          value={editForm.status}
                          onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          className="text-[12px] font-black glass-input rounded-xl px-4 py-2.5 w-full outline-none"
                        >
                          <option value="pending">Pending Audit</option>
                          <option value="approved">Global Approved</option>
                          <option value="flagged">Manually Flagged</option>
                          <option value="deleted">Blacklisted</option>
                        </select>
                      ) : (
                        <div className="flex flex-col items-start gap-3">
                          <div className={`flex items-center gap-2.5 py-1.5 px-3 rounded-xl border ${
                            comment.status === 'deleted' ? 'bg-red-50 text-red-600 border-red-100' : 
                            comment.status === 'approved' ? 'bg-[#fff1f1] text-[#ff0000] border-red-100' :
                            comment.status === 'flagged' ? 'bg-[#f7f7f7] text-[#606060] border-[#e5e5e5]' : 'bg-gray-50 text-[#909090] border-gray-100'
                          }`}>
                            {comment.status === 'deleted' ? <ShieldAlert size={14} /> : 
                             comment.status === 'approved' ? <ShieldCheck size={14} /> :
                             comment.status === 'flagged' ? <AlertTriangle size={14} /> : <Clock size={14} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {comment.status === 'approved' ? 'AI Secure' : comment.status}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            {comment.deleteFailed && (
                              <div className="text-[9px] font-black text-[#d93025] uppercase tracking-widest flex items-center gap-1.5">
                                 <XCircle size={10} /> Execution Error (Del)
                              </div>
                            )}
                            {comment.autoLiked && (
                              <div className="text-[9px] font-black text-[#ff0000] uppercase tracking-widest flex items-center gap-1.5 bg-[#fff1f1] px-2 py-0.5 rounded-lg border border-red-100">
                                 <Zap size={10} fill="currentColor" /> Autonomous Like
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-6 px-6 align-top text-right">
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                           <a href={`https://youtube.com/watch?v=${comment.videoId}`} target="_blank" className="p-3 bg-white/45 border border-white/50 text-[#606060] hover:text-[#ff0000] hover:border-[#ff0000]/20 hover:bg-white/60 rounded-xl transition-all shadow-sm" title="Watch Original">
                             <Eye size={16} />
                           </a>
                           <div className="w-px h-6 bg-white/40 mx-1" />
                           {editingId === comment._id ? (
                            <div className="flex gap-2">
                              <button onClick={() => saveEdit(comment._id)} className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-[#e50914] text-white border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest hover:translate-y-[-2px] transition-all flex items-center gap-2 shadow-sm">
                                <CheckCircle2 size={14} /> Commit
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-2.5 bg-white/40 border border-white/50 text-[#909090] rounded-xl hover:bg-white/60 hover:text-red-600 transition-all">
                                <XCircle size={18} />
                              </button>
                            </div>
                           ) : (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button onClick={() => handleAction(comment._id, 'like')} className="p-2.5 bg-white/45 border border-white/50 hover:bg-white/65 hover:border-blue-500/20 text-[#606060] hover:text-[#ff0000] rounded-xl transition-all shadow-sm" title="Force Like"><Heart size={16} /></button>
                              <button onClick={() => handleAction(comment._id, 'approve')} className="p-2.5 bg-white/45 border border-white/50 hover:bg-white/65 hover:border-red-500/20 text-[#606060] hover:text-[#ff0000] rounded-xl transition-all shadow-sm" title="Approve"><CheckCircle2 size={16} /></button>
                              <button onClick={() => startEdit(comment)} className="p-2.5 bg-white/45 border border-white/50 hover:bg-white/65 hover:border-[#0f0f0f] text-[#606060] hover:text-[#0f0f0f] rounded-xl transition-all shadow-sm" title="Edit Properties"><Edit3 size={16} /></button>
                              <button onClick={() => handleAction(comment._id, 'delete')} className="p-2.5 bg-white/45 border border-white/50 hover:bg-white/65 hover:border-red-500/20 text-[#606060] hover:text-[#d93025] rounded-xl transition-all shadow-sm" title="Erase Permanently"><Trash2 size={16} /></button>
                            </div>
                           )}
                        </div>
                        
                        {editingId === comment._id && (
                          <div className="w-full max-w-[200px]">
                            <input 
                              type="text" 
                              placeholder="Audit metadata/note..."
                              value={editForm.note}
                              onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                              className="text-[11px] w-full glass-input rounded-xl p-3 focus:outline-none focus:border-[#ff0000]/20 transition-all placeholder-[#ccc] font-medium"
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModerationQueue;
