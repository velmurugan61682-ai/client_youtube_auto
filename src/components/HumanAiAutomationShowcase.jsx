import React from 'react';
import { Bot, MessageCircle, ShieldCheck, Zap, CheckCircle2, Terminal, UserCheck, Pause, Play } from 'lucide-react';

const HumanAiAutomationShowcase = () => {
  const stats = [
    ['Time Saved / Week', '18+ Hours'],
    ['AI Response Speed', '< 2 Seconds'],
    ['Comment Accuracy', '99.4%'],
    ['Lead Capture', 'Automated'],
  ];

  const logs = [
    ['HUMAN', 'Creator set growth target: +15,000 subscribers'],
    ['AI', 'Contextual reply generated for a YouTube comment'],
    ['SHIELD', 'Blocked scam links automatically'],
    ['LEAD', 'Captured WhatsApp lead from pricing comment'],
  ];

  return (
    <section className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 text-[#0f0f0f]">
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#fff1f1] border border-red-100 rounded-full text-[#ff0000] text-xs font-black uppercase tracking-widest">
          <MessageCircle size={14} />
          <span>YouTube Automation Dialogue</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
          Live YouTube Workflow Between <span className="text-[#ff0000]">Creator & AI Co-Pilot</span>
        </h2>
        <p className="text-[#606060] font-semibold text-sm sm:text-base leading-relaxed">
          A focused preview of how Channelmate handles replies, moderation, lead capture, and creator operations.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        {[
          [UserCheck, 'Interactive Talking Mode'],
          [Bot, 'Turbo AI Autopilot'],
          [ShieldCheck, 'Active Moderation Shield'],
        ].map(([Icon, label], index) => (
          <button key={label} className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2 border shadow-sm ${index === 0 ? 'bg-[#ff0000] text-white border-[#ff0000]' : 'bg-white text-[#0f0f0f] border-[#e5e5e5] hover:bg-[#fff1f1] hover:text-[#ff0000]'}`}>
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-[28px] border border-[#e5e5e5] bg-white p-5 sm:p-7 shadow-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#eeeeee]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff0000] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-[#0f0f0f]">Live Conversation Simulation</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-full bg-[#fff1f1] text-[#ff0000] border border-red-100 text-xs font-black flex items-center gap-2">
              <Pause size={14} /> Pause Dialogue
            </button>
            <button className="px-4 py-2 rounded-full bg-[#0f0f0f] text-white text-xs font-black flex items-center gap-2">
              <Play size={14} /> Message 1
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-7 items-stretch">
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-[24px] bg-[#0f0f0f] text-white border border-[#242424] p-5 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-[#ff0000] flex items-center justify-center font-black">CM</div>
                  <div>
                    <h4 className="text-sm font-black">Creator + Channelmate AI</h4>
                    <p className="text-[10px] font-semibold text-[#aaaaaa]">Live workflow interaction</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                  <span className="h-3 w-1 rounded-full bg-[#ff0000] animate-bounce" />
                  <span className="h-5 w-1 rounded-full bg-[#ff0000] animate-bounce [animation-delay:0.2s]" />
                  <span className="h-2 w-1 rounded-full bg-[#ff0000] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-[#181818] border border-white/10 p-4 text-sm font-semibold leading-relaxed">
                Channelmate, handle my new video comments, remove spam, reply to product questions, and capture WhatsApp leads automatically.
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black text-red-100">
                <span className="inline-flex items-center gap-1"><Zap size={12} /> AI replies</span>
                <span className="inline-flex items-center gap-1"><ShieldCheck size={12} /> Spam shield</span>
                <span className="inline-flex items-center gap-1"><CheckCircle2 size={12} /> Lead capture</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-[18px] bg-white border border-[#e5e5e5] p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#606060]">Creator</p>
                <p className="mt-2 text-sm font-black">Sets goals, reviews important leads, and directs content strategy.</p>
              </div>
              <div className="rounded-[18px] bg-[#fff1f1] border border-red-100 p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ff0000]">Channelmate AI</p>
                <p className="mt-2 text-sm font-black">Replies, moderates, auto-likes, and routes high-value contacts.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-[20px] overflow-hidden border border-[#e5e5e5] shadow-xl">
              <img src="/yt_human_male_ai_talking.png" alt="Creator talking with Channelmate AI" className="w-full h-60 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/90 via-transparent to-transparent p-4 flex flex-col justify-end">
                <span className="w-fit rounded-md bg-[#ff0000] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">YouTube AI Workflow</span>
                <p className="mt-2 text-xs font-bold text-white">Creator operations with live AI assistance</p>
              </div>
            </div>

            <div className="rounded-[20px] bg-[#0f0f0f] p-4 border border-[#242424] text-[#e5e5e5] font-mono text-[11px] shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Terminal size={14} className="text-[#ff0000]" /> Automation Logs</span>
                <span className="rounded bg-[#ff0000]/20 px-2 py-0.5 text-[#ff0000] text-[9px] font-black">LIVE</span>
              </div>
              <div className="space-y-2">
                {logs.map(([type, text]) => <p key={text}><span className="text-[#ff0000]">[{type}]</span> {text}</p>)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 pt-5 border-t border-[#eeeeee] grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-[#f7f7f7] border border-[#e5e5e5] p-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#606060]">{label}</p>
              <p className="mt-1 text-lg font-black text-[#0f0f0f]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HumanAiAutomationShowcase;
