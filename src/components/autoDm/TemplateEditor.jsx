import React, { useState } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';

const TemplateEditor = ({ templates, onChange }) => {
  const [newTemplate, setNewTemplate] = useState('');

  const handleTemplateChange = (index, value) => {
    const updated = [...templates];
    updated[index] = value;
    onChange(updated);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const val = newTemplate.trim();
    if (val) {
      onChange([...templates, val]);
      setNewTemplate('');
    }
  };

  const handleRemove = (index) => {
    if (templates.length <= 1) {
      alert('You must keep at least 1 reply template!');
      return;
    }
    const updated = templates.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className="yt-card p-6 border-[#e5e5e5]">
      <h2 className="text-lg font-black text-[#0f0f0f] tracking-tight mb-2">Reply Templates</h2>
      <p className="text-xs text-[#606060] font-medium mb-4">
        Customize the responses sent to commenters. One template will be chosen at random for each reply.
      </p>

      <div className="bg-[#f0f4f9] border border-[#d2e3fc] rounded-2xl p-4 flex gap-3 text-[#065fd4] mb-6">
        <Info size={20} className="flex-shrink-0 mt-0.5" />
        <div className="text-xs font-semibold leading-relaxed">
          <p className="font-bold text-[#0f0f0f] mb-1">How to use variables:</p>
          Use <code className="bg-white border border-[#d2e3fc] px-1 py-0.5 rounded font-black">{`{whatsapp_link}`}</code> in your templates to automatically inject the WhatsApp wa.me link.
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {templates.map((tpl, index) => (
          <div key={index} className="flex gap-2 items-center">
            <div className="text-xs font-black text-[#909090] w-6 flex-shrink-0 text-center">#{index + 1}</div>
            <input
              type="text"
              value={tpl}
              onChange={(e) => handleTemplateChange(index, e.target.value)}
              placeholder="e.g. For details message on WhatsApp: {whatsapp_link}"
              className="flex-1 bg-[#f9f9f9] border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff0000]/30 transition-all font-medium text-[#0f0f0f]"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="w-10 h-10 rounded-xl bg-white border border-[#e5e5e5] text-[#909090] hover:text-[#ff0000] hover:bg-[#fce8e6] hover:border-[#ff0000]/10 flex items-center justify-center transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="Create new reply template... (remember to include {whatsapp_link})"
          value={newTemplate}
          onChange={(e) => setNewTemplate(e.target.value)}
          className="flex-1 bg-[#f9f9f9] border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff0000]/30 transition-all font-medium"
        />
        <button
          type="submit"
          className="bg-[#0f0f0f] hover:bg-[#0f0f0f]/90 text-white rounded-xl px-4 py-2.5 flex items-center justify-center transition-colors shadow-sm font-bold text-xs uppercase tracking-widest gap-2 flex-shrink-0"
        >
          <Plus size={16} />
          Add Template
        </button>
      </form>
    </div>
  );
};

export default TemplateEditor;
