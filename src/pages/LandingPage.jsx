import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  MessageSquare, 
  ArrowRight,
  Sparkles,
  Lock,
  Eye,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const features = [
    {
      icon: <ShieldCheck className="text-red-600" size={24} />,
      title: "AI Comment Moderation",
      desc: "Instantly analyze viewer comments for sentiment, flagging toxicity and filtering out spam in real-time."
    },
    {
      icon: <Zap className="text-amber-600" size={24} />,
      title: "Smart Auto Replies",
      desc: "Engage your audience 24/7 with custom, context-aware auto-replies powered by DeepSeek AI."
    },
    {
      icon: <BarChart3 className="text-blue-600" size={24} />,
      title: "Deep Analytics",
      desc: "Visualize emotional distribution, tracking trends, category breakdowns, and performance analytics."
    },
    {
      icon: <Lock className="text-emerald-650" size={24} />,
      title: "Secure Google OAuth",
      desc: "Seamless, secure integration through Google's official API. Your account credentials are never exposed."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 font-['Outfit'] relative overflow-x-hidden selection:bg-red-500/20 selection:text-red-900">
      {/* Highly Vibrant Background Mesh for beautiful Glassmorphism visibility */}
      <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#ff0055] to-[#ff7700] opacity-20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#0055ff] to-[#aa00ff] opacity-20 blur-[130px] pointer-events-none" />
      <div className="absolute top-[25%] left-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] opacity-15 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[30%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#f000ff] to-[#7000ff] opacity-15 blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/15 backdrop-blur-2xl border-b border-white/30 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <img src="/logo.svg" className="w-9 h-9 object-contain" alt="Logo" />
            <div className="flex flex-col -gap-1">
              <span className="text-[17px] font-black tracking-tighter text-zinc-900">TECH VASEEGRAAH</span>
              <span className="text-[10px] font-black text-red-500 tracking-[0.2em] -mt-1 uppercase">CREATOR AI</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-[13px] font-bold text-zinc-655 hover:text-zinc-900 transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="text-[13px] font-black bg-[#ff0000] hover:bg-[#cc0000] text-white px-5 py-2.5 rounded-xl transition-all shadow-[0_8px_20px_-6px_rgba(255,0,0,0.4)] active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/40 border border-white/60 text-red-650 rounded-full mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-md">
            <Sparkles size={13} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Advanced Creator Tools</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6 bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-950 bg-clip-text text-transparent">
            Tech Vaseegraah Creator AI
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4 uppercase tracking-wider">
            AI-Powered YouTube Moderation Platform
          </h2>
          <p className="text-[15px] sm:text-[17px] text-zinc-600 font-semibold leading-relaxed mb-10 max-w-2xl mx-auto">
            Tech Vaseegraah Creator AI is an AI-powered platform that helps YouTube creators automatically moderate comments, detect spam, generate intelligent AI replies, analyze audience sentiment, and securely manage their channels using Google OAuth and the YouTube Data API.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              to="/register" 
              className="w-full sm:w-auto text-[14px] font-black bg-zinc-950 hover:bg-zinc-900 text-white px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.15)] group"
            >
              Start Moderating Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto text-[14px] font-bold bg-white/30 hover:bg-white/65 text-zinc-800 border border-white/65 px-8 py-3.5 rounded-xl transition-all flex items-center justify-center shadow-sm backdrop-blur-md"
            >
              Sign In to Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">Powerful Features for Modern Creators</h2>
          <p className="text-zinc-500 text-[13px] sm:text-[14px] font-semibold mt-2">Everything you need to moderate and grow your channel.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white/20 hover:bg-white/35 backdrop-blur-2xl border border-white/45 hover:border-white/60 rounded-[28px] p-6 transition-all duration-300 flex gap-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] text-zinc-800 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
            >
              <div className="p-3 bg-white/60 rounded-2xl h-fit border border-white/50 shadow-sm">
                {f.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900">{f.title}</h3>
                <p className="text-zinc-500 text-xs sm:text-[13px] font-semibold leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Google OAuth & Data Usage Explanation (Google Verification Requirement) */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white/25 border border-white/45 rounded-[32px] p-8 sm:p-10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden text-zinc-850">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-zinc-950">
            <Lock size={120} />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-600">
              <Eye size={16} />
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-blue-600">Data Access & Transparency</h2>
          </div>
          <div className="space-y-4 text-zinc-700 text-xs sm:text-[13px] font-semibold leading-relaxed">
            <p>
              To provide automated services, the <strong>Tech Vaseegraah Creator AI</strong> requests permission to view and manage your YouTube comments and channel details via official Google OAuth APIs.
            </p>
            <ul className="space-y-2 list-disc list-inside pl-1 text-zinc-600">
              <li>We fetch comment threads on your connected videos to run our AI analysis.</li>
              <li>We process comments locally inside our secure API to determine sentiment (positive, neutral, toxic).</li>
              <li>We post replies or flag comments exclusively based on the Auto-Reply templates you define.</li>
              <li>We encrypt and store OAuth tokens securely. We never share your data with external third parties.</li>
            </ul>
            <p className="pt-2 border-t border-zinc-200/50 text-[11px] text-zinc-400">
              By connecting your YouTube account, you authorize Tech Vaseegraah Creator AI to perform actions on your behalf in compliance with Google's API policies. You can revoke this access at any time directly through your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-0.5">Google Security Settings <ExternalLink size={10} /></a>.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-200/50 bg-white/10 backdrop-blur-xl py-12 text-zinc-650">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span>&copy; {new Date().getFullYear()} Tech Vaseegraah Creator AI.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold text-zinc-500">
            <Link to="/privacy" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-zinc-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
