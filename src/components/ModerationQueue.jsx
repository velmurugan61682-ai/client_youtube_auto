import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { io } from 'socket.io-client';
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

const ModerationQueue = ({ onAction, searchQuery }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ sentiment: '', status: '', note: '' });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchComments();

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socket.on('stats_updated', fetchComments);
    socket.on('new_comment_analyzed', fetchComments);
    
    return () => socket.disconnect();
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
      setComments(res.data);
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
      <div className="flex items-center gap-3 p-6 bg-white border-b border-[#f0f0f0] overflow-x-auto no-scrollbar scroll-smooth">
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
                  ? 'bg-[#0f0f0f] text-white border-[#0f0f0f] shadow-lg shadow-black/10' 
                  : 'bg-white text-[#606060] border-[#f0f0f0] hover:border-[#ff0000]/30 hover:text-[#0f0f0f]'
              }`}
            >
              {f.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.dot }} />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar">
        <table className="w-full border-separate border-spacing-0 min-w-[1000px]">
          <thead>
            <tr className="bg-[#fcfcfc]">
              <th className="text-left py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-[#f0f0f0]">Author & Intelligence</th>
              <th className="text-left py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-[#f0f0f0]">Evaluation</th>
              <th className="text-left py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-[#f0f0f0]">AI Status</th>
              <th className="text-right py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-[#f0f0f0]">Audit Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
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
                  .map((comment, i) => (
                  <motion.tr 
                    key={comment._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`group transition-all hover:bg-[#fcfcfc] ${editingId === comment._id ? 'bg-red-50/30' : ''}`}
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
                                <Clock size={10} /> {formatDistanceToNow(new Date(comment.publishedAt))}
                              </span>
                            </div>
                          </div>
                          <p className="text-[13.5px] text-[#222] font-medium leading-relaxed mb-4 max-w-[500px]">"{comment.text}"</p>
                          
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
                                      isPositive ? 'bg-green-50 text-green-700 border-green-100' :
                                      isNegative ? 'bg-red-50 text-red-700 border-red-100' :
                                      'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}
                                  >
                                    <div className={`w-1 h-1 rounded-full ${isPositive ? 'bg-green-500' : isNegative ? 'bg-red-500' : 'bg-blue-500'}`} />
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
                              className="appearance-none text-[12px] font-black border border-[#f0f0f0] rounded-xl px-4 py-2.5 w-full bg-white focus:border-[#ff0000]/20 outline-none"
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
                          className="text-[12px] font-black border border-[#f0f0f0] rounded-xl px-4 py-2.5 w-full bg-white outline-none"
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
                            comment.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                            comment.status === 'flagged' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-50 text-[#909090] border-gray-100'
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
                              <div className="text-[9px] font-black text-[#065fd4] uppercase tracking-widest flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
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
                           <a href={`https://youtube.com/watch?v=${comment.videoId}`} target="_blank" className="p-3 bg-white border border-[#f0f0f0] text-[#909090] hover:text-[#ff0000] hover:border-[#ff0000]/20 rounded-xl transition-all shadow-sm" title="Watch Original">
                            <Eye size={16} />
                           </a>
                           <div className="w-px h-6 bg-[#f0f0f0] mx-1" />
                           {editingId === comment._id ? (
                            <div className="flex gap-2">
                              <button onClick={() => saveEdit(comment._id)} className="px-4 py-2.5 bg-[#0f0f0f] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:translate-y-[-2px] transition-all flex items-center gap-2">
                                <CheckCircle2 size={14} /> Commit
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-2.5 bg-white border border-[#f0f0f0] text-[#909090] rounded-xl hover:bg-gray-50 transition-all">
                                <XCircle size={18} />
                              </button>
                            </div>
                           ) : (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button onClick={() => handleAction(comment._id, 'like')} className="p-2.5 bg-white border border-[#f0f0f0] hover:border-blue-500/20 text-[#606060] hover:text-[#065fd4] rounded-xl transition-all shadow-sm" title="Force Like"><Heart size={16} /></button>
                              <button onClick={() => handleAction(comment._id, 'approve')} className="p-2.5 bg-white border border-[#f0f0f0] hover:border-green-500/20 text-[#606060] hover:text-[#2ba640] rounded-xl transition-all shadow-sm" title="Approve"><CheckCircle2 size={16} /></button>
                              <button onClick={() => startEdit(comment)} className="p-2.5 bg-white border border-[#f0f0f0] hover:border-[#0f0f0f] text-[#606060] hover:text-[#0f0f0f] rounded-xl transition-all shadow-sm" title="Edit Properties"><Edit3 size={16} /></button>
                              <button onClick={() => handleAction(comment._id, 'delete')} className="p-2.5 bg-white border border-[#f0f0f0] hover:border-red-500/20 text-[#606060] hover:text-[#d93025] rounded-xl transition-all shadow-sm" title="Erase Permanently"><Trash2 size={16} /></button>
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
                              className="text-[11px] w-full bg-white border border-[#f0f0f0] rounded-xl p-3 focus:outline-none focus:border-[#ff0000]/20 transition-all placeholder-[#ccc] font-medium"
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
