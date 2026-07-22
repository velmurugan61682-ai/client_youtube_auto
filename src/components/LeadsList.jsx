import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Search, 
  Filter, 
  Download, 
  User, 
  MessageSquare, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Youtube,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LeadsList = ({ searchQuery: globalSearch }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');

  useEffect(() => {
    fetchLeads();
    fetchChannels();
  }, [filterStatus, selectedChannel]);

  // Handle global search from header
  useEffect(() => {
    if (globalSearch !== undefined) {
      setSearchQuery(globalSearch);
    }
  }, [globalSearch]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let url = '/leads?';
      if (filterStatus) url += `status=${filterStatus}&`;
      if (selectedChannel) url += `channelId=${selectedChannel}&`;
      if (searchQuery) url += `search=${searchQuery}&`;
      
      const res = await api.get(url);
      setLeads(res.data);
    } catch (err) {
      console.error('Fetch Leads Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await api.get('/youtube/channels');
      setChannels(res.data);
    } catch (err) {
      console.error('Fetch Channels Error:', err);
    }
  };

  const handleExport = () => {
    window.open(`${api.defaults.baseURL}/leads/export`, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'text-[#ff0000] bg-[#e6f4ea]';
      case 'pending': return 'text-[#065fd4] bg-[#e8f0fe]';
      case 'failed': return 'text-[#d93025] bg-[#fce8e6]';
      case 'duplicate': return 'text-[#f9ab00] bg-[#fff8e1]';
      default: return 'text-[#606060] bg-[#f9f9f9]';
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.authorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.whatsappNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.originalComment?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-end gap-2">
        <button 
          onClick={handleExport}
          className="flex items-center gap-1.5 bg-white border border-[#e5e5e5] rounded-xl px-3 sm:px-4 py-2 text-xs font-bold text-[#0f0f0f] shadow-sm hover:bg-[#f9f9f9] transition-colors"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
        <button 
          onClick={fetchLeads}
          className="yt-btn-primary !py-2 !px-4 !text-xs !rounded-xl"
        >
          Refresh
        </button>
      </div>

      <div className="yt-card !p-3 sm:!p-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#909090]" size={16} />
          <input 
            type="text" 
            placeholder="Search leads by name, comment, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f9f9f9] border border-[#e5e5e5] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#ff0000]/30 transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 sm:flex-initial bg-white border border-[#e5e5e5] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#0f0f0f] shadow-sm outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="duplicate">Duplicate</option>
          </select>

          <select 
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="flex-1 sm:flex-initial bg-white border border-[#e5e5e5] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#0f0f0f] shadow-sm outline-none cursor-pointer"
          >
            <option value="">All Channels</option>
            {channels.map(c => <option key={c.channelId} value={c.channelId}>{c.title}</option>)}
          </select>
        </div>
      </div>

      {/* Mobile Card List (Visible on Small Screens) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="yt-card p-4 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
          ))
        ) : filteredLeads.length === 0 ? (
          <div className="yt-card p-8 text-center text-slate-400">
            <User size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs font-bold">No leads found matching your filters.</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead._id} className="yt-card !p-4 space-y-3 border-[#e5e5e5] bg-white rounded-2xl shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#0f0f0f] truncate">{lead.authorName}</p>
                    <p className="text-[10px] font-semibold text-[#909090] flex items-center gap-1">
                      <Youtube size={10} />
                      {channels.find(c => c.channelId === lead.channelId)?.title || 'Channel'}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </div>

              {lead.whatsappNumber && lead.whatsappNumber !== 'None' ? (
                <div className="bg-[#fff1f1] border border-red-100 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#ff0000]" />
                    <span className="text-xs font-black text-slate-900">{lead.whatsappNumber}</span>
                  </div>
                  <a 
                    href={`https://wa.me/${lead.whatsappNumber}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#25D366] text-white text-[11px] font-black rounded-lg shadow-sm hover:bg-[#20bd5a] flex items-center gap-1"
                  >
                    Chat
                  </a>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-xs font-bold text-slate-400">
                  No WhatsApp Number
                </div>
              )}

              {lead.originalComment && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl italic line-clamp-2">
                  "{lead.originalComment}"
                </p>
              )}

              <div className="flex items-center justify-between pt-1 text-[10px] font-medium text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {new Date(lead.createdAt).toLocaleDateString()}
                </span>
                {lead.videoId && (
                  <a 
                    href={`https://www.youtube.com/watch?v=${lead.videoId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Youtube size={12} /> View Video
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (Visible on Medium+ Screens) */}
      <div className="hidden md:block yt-card !p-0 overflow-hidden border-[#e5e5e5]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f9f9f9] border-b border-[#f0f0f0]">
                <th className="px-6 py-4 text-[11px] font-black text-[#909090] uppercase tracking-wider w-[20%]">Author</th>
                <th className="px-6 py-4 text-[11px] font-black text-[#909090] uppercase tracking-wider w-[18%]">WhatsApp</th>
                <th className="px-6 py-4 text-[11px] font-black text-[#909090] uppercase tracking-wider w-[12%]">Status</th>
                <th className="px-6 py-4 text-[11px] font-black text-[#909090] uppercase tracking-wider">Comment</th>
                <th className="px-6 py-4 text-[11px] font-black text-[#909090] uppercase tracking-wider w-[12%]">Time</th>
                <th className="px-6 py-4 text-[11px] font-black text-[#909090] uppercase tracking-wider w-[10%] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              <AnimatePresence>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-8">
                        <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <User size={48} className="mb-4" />
                        <p className="text-sm font-bold">No leads found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <motion.tr 
                      key={lead._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[#fcfcfc] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-[#606060]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#0f0f0f] truncate">{lead.authorName}</p>
                            <p className="text-[10px] font-medium text-[#909090] flex items-center gap-1">
                              <Youtube size={10} />
                              {channels.find(c => c.channelId === lead.channelId)?.title || 'Channel'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[#0f0f0f]">{lead.whatsappNumber}</span>
                          {lead.whatsappSent && (
                            <span className="text-[10px] font-bold text-[#ff0000] flex items-center gap-1">
                              <CheckCircle2 size={10} /> WhatsApp Sent
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                        {lead.isHidden && (
                          <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-[#909090]">
                            <EyeOff size={10} /> Hidden on YT
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        <p className="text-xs text-[#606060] line-clamp-1 italic">"{lead.originalComment}"</p>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#606060]">
                           <Clock size={12} />
                           {new Date(lead.createdAt).toLocaleDateString()}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <a 
                             href={`https://wa.me/${lead.whatsappNumber}`} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="p-2 hover:bg-[#25D366]/10 rounded-lg text-[#25D366] transition-colors"
                             title="Chat on WhatsApp"
                           >
                             <Phone size={16} />
                           </a>
                           <a 
                             href={`https://www.youtube.com/watch?v=${lead.videoId}`} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="p-2 hover:bg-[#ff0000]/10 rounded-lg text-[#ff0000] transition-colors"
                             title="View Video"
                           >
                             <Youtube size={16} />
                           </a>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-[#f0f0f0] flex items-center justify-between bg-[#f9f9f9]">
           <p className="text-[11px] font-bold text-[#909090]">
             Showing {filteredLeads.length} of {leads.length} leads
           </p>
           <div className="flex items-center gap-2">
             <button className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-[#e5e5e5] text-[#909090] disabled:opacity-30" disabled>
               <ChevronLeft size={16} />
             </button>
             <button className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-[#e5e5e5] text-[#909090] disabled:opacity-30" disabled>
               <ChevronRight size={16} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsList;

