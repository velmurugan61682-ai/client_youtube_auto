import React from 'react';
import { User, Youtube, ExternalLink, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RepliedHistoryTable = ({ history, loading, page, pages, onPageChange }) => {
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="yt-card !p-0 overflow-hidden border-[#e5e5e5]">
      <div className="px-6 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
        <h2 className="text-lg font-black text-[#0f0f0f] tracking-tight">Replied Comments History</h2>
        <span className="text-xs font-bold text-[#909090]">
          Total replies: {history?.total || 0}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f9f9f9] border-b border-[#f0f0f0]">
              <th className="px-6 py-4 text-[11px] font-black text-[#909090] uppercase tracking-wider w-[20%]">Author</th>
              <th className="px-6 py-4 text-[11px] font-black text-[#909090] uppercase tracking-wider">Comment</th>
              <th className="px-6 py-4 text-[11px] font-black text-[#909090] uppercase tracking-wider w-[15%]">Matched Keyword</th>
              <th className="px-6 py-4 text-[11px] font-black text-[#909090] uppercase tracking-wider w-[20%]">Reply Sent</th>
              <th className="px-6 py-4 text-[11px] font-black text-[#909090] uppercase tracking-wider w-[15%]">WhatsApp Link</th>
              <th className="px-6 py-4 text-[11px] font-black text-[#909090] uppercase tracking-wider w-[10%]">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f0]">
            <AnimatePresence mode="wait">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-6">
                      <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                    </td>
                  </tr>
                ))
              ) : !history || history.data?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <MessageSquare size={40} className="mb-4" />
                      <p className="text-sm font-bold">No replies sent yet for this video.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.data.map((item) => (
                  <motion.tr
                    key={item._id}
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
                          <p className="text-sm font-bold text-[#0f0f0f] truncate">{item.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[250px]">
                      <p className="text-xs text-[#606060] line-clamp-2 italic font-medium">
                        "{item.commentText}"
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-[#065fd4] bg-[#e8f0fe] border border-[#d2e3fc]">
                        {item.matchedKeyword}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[250px]">
                      <p className="text-xs text-[#0f0f0f] font-bold line-clamp-2">
                        {item.replyText}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {item.whatsappLink && (
                        <a
                          href={item.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2ba640] hover:text-[#218032] flex items-center gap-1 text-xs font-bold transition-colors"
                        >
                          {item.whatsappLink.replace('https://', '')}
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-[#909090] whitespace-nowrap">
                        {formatTime(item.repliedAt)}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && history && history.pages > 1 && (
        <div className="px-6 py-4 border-t border-[#f0f0f0] flex items-center justify-between">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-xs font-black uppercase tracking-widest text-[#0f0f0f] disabled:opacity-40 disabled:pointer-events-none hover:bg-[#f9f9f9] transition-all"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-xs font-black text-[#909090]">
            Page {page} of {history.pages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === history.pages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-xs font-black uppercase tracking-widest text-[#0f0f0f] disabled:opacity-40 disabled:pointer-events-none hover:bg-[#f9f9f9] transition-all"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RepliedHistoryTable;
