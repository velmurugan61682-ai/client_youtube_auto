import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const KeywordEditor = ({ keywords, onChange }) => {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const keyword = newKeyword.trim().toLowerCase();
    if (keyword && !keywords.includes(keyword)) {
      onChange([...keywords, keyword]);
      setNewKeyword('');
    }
  };

  const handleRemove = (keywordToRemove) => {
    onChange(keywords.filter((kw) => kw !== keywordToRemove));
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
          className="bg-[#0f0f0f] hover:bg-[#0f0f0f]/90 text-white rounded-xl px-4 py-2.5 flex items-center justify-center transition-colors shadow-sm"
        >
          <Plus size={18} />
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
                className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[#909090] hover:text-[#ff0000] hover:bg-[#fce8e6] transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KeywordEditor;
