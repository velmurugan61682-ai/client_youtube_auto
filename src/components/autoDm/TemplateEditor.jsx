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
    <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm">
      <h2 className="text-lg font-black text-[#0f0f0f] tracking-tight mb-2">Reply Templates</h2>
      <p className="text-xs text-[#606060] font-semibold mb-4">
        Customize the responses sent to commenters. One template will be chosen at random for each reply.
      </p>

      <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 flex gap-3 text-green-700 mb-6">
        <Info size={20} className="flex-shrink-0 mt-0.5" />
        <div className="text-xs font-semibold leading-relaxed">
          <p className="font-bold text-[#0f0f0f] mb-1">How to use variables:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Use <code className="bg-white border border-green-500/10 px-1 py-0.5 rounded font-black">{`{whatsapp_link}`}</code> to automatically inject the WhatsApp wa.me link.</li>
            <li>Use <code className="bg-white border border-green-500/10 px-1 py-0.5 rounded font-black">{`{product_link}`}</code> to automatically inject the product destination link.</li>
          </ul>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {templates.map((tpl, index) => (
          <div key={index} className="flex gap-3 items-center bg-slate-50 border border-slate-100 rounded-2xl p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            <span className="bg-[#22c55e]/15 text-[#22c55e] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
              Active
            </span>
            <input
              type="text"
              value={tpl}
              onChange={(e) => handleTemplateChange(index, e.target.value)}
              placeholder="e.g. For details message on WhatsApp: {whatsapp_link}"
              className="flex-1 bg-transparent border-none text-sm focus:outline-none font-semibold text-slate-800"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-[#909090] hover:text-[#ef4444] hover:bg-red-50 hover:border-red-100 flex items-center justify-center transition-all shadow-sm shrink-0"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="Create new reply template..."
          value={newTemplate}
          onChange={(e) => setNewTemplate(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#22c55e]/30 transition-all font-semibold"
        />
        <button
          type="submit"
          className="bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl px-5 py-3 flex items-center justify-center transition-colors shadow-sm font-black text-xs uppercase tracking-widest gap-1.5 flex-shrink-0"
        >
          <Plus size={16} />
          Add Template
        </button>
      </form>
    </div>
  );
};

export default TemplateEditor;
