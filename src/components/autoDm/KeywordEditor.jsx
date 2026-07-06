import React, { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { addKeyword, removeKeyword } from '../../services/api/autoDmApi';

// FIX #5: KeywordEditor now calls atomic $addToSet / $pull backend routes directly.
// This prevents existing keywords from being deleted when a new keyword is added,
// which happened because the old flow replaced the full array on save.
const KeywordEditor = ({ keywords, onChange, videoId }) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [adding, setAdding] = useState(false);
  const [removingKeyword, setRemovingKeyword] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    const keyword = newKeyword.trim().toLowerCase();
    if (!keyword || keywords.includes(keyword)) return;

    // If a videoId is provided, use the atomic backend route (Fix #5).
    // Otherwise fall back to local-only update (pre-save state before config exists).
    if (videoId) {
      try {
        setAdding(true);
        const data = await addKeyword(videoId, keyword);
        // Sync local state with authoritative DB response
        onChange(data.keywords || [...keywords, keyword]);
        console.log(`[Fix #5] Keyword "${keyword}" added via $addToSet. Updated list: ${JSON.stringify(data.keywords)} (KeywordEditor.jsx)`);
      } catch (err) {
        console.error('[Fix #5] Failed to add keyword via API, falling back to local state:', err);
        onChange([...keywords, keyword]);
      } finally {
        setAdding(false);
      }
    } else {
      // No config saved yet — update local state only; will be persisted on Save
      onChange([...keywords, keyword]);
    }
    setNewKeyword('');
  };

  const handleRemove = async (keywordToRemove) => {
    // If a videoId is provided, use the atomic backend route (Fix #5).
    if (videoId) {
      try {
        setRemovingKeyword(keywordToRemove);
        const data = await removeKeyword(videoId, keywordToRemove);
        onChange(data.keywords || keywords.filter((kw) => kw !== keywordToRemove));
        console.log(`[Fix #5] Keyword "${keywordToRemove}" removed via $pull. Updated list: ${JSON.stringify(data.keywords)} (KeywordEditor.jsx)`);
      } catch (err) {
        console.error('[Fix #5] Failed to remove keyword via API, falling back to local state:', err);
        onChange(keywords.filter((kw) => kw !== keywordToRemove));
      } finally {
        setRemovingKeyword(null);
      }
    } else {
      onChange(keywords.filter((kw) => kw !== keywordToRemove));
    }
  };

  return (
    <div className="yt-card p-6 border-[#e5e5e5]">
      <h2 className="text-lg font-black text-[#0f0f0f] tracking-tight mb-2">Keyword Triggers</h2>
      <p className="text-xs text-[#606060] font-medium mb-4">
        Comments containing any of these keywords (case-insensitive) will trigger the automatic reply.
      </p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Add trigger keyword (e.g. price)"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          className="flex-1 bg-[#f9f9f9] border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff0000]/30 transition-all font-medium"
        />
        <button
          type="submit"
          disabled={adding}
          className="bg-[#0f0f0f] hover:bg-[#0f0f0f]/90 text-white rounded-xl px-4 py-2.5 flex items-center justify-center transition-colors shadow-sm disabled:opacity-55"
        >
          {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {keywords.length === 0 ? (
          <p className="text-xs text-[#909090] font-medium italic">No keywords added. Adding keywords is required to trigger replies.</p>
        ) : (
          keywords.map((kw) => (
            <div
              key={kw}
              className="flex items-center gap-1.5 bg-[#f3f3f3] text-[#0f0f0f] border border-[#e5e5e5] rounded-full pl-3 pr-1.5 py-1 text-xs font-bold transition-all hover:bg-[#eaeaea]"
            >
              <span>{kw}</span>
              <button
                type="button"
                onClick={() => handleRemove(kw)}
                disabled={removingKeyword === kw}
                className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[#909090] hover:text-[#ff0000] hover:bg-[#fce8e6] transition-colors disabled:opacity-55"
              >
                {removingKeyword === kw ? <Loader2 size={8} className="animate-spin" /> : <X size={10} />}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KeywordEditor;
