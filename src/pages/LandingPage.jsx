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
      icon: <ShieldCheck className="text-red-500" size={24} />,
      title: "AI Comment Moderation",
      desc: "Instantly analyze viewer comments for sentiment, flagging toxicity and filtering out spam in real-time."
    },
    {
      icon: <Zap className="text-amber-500" size={24} />,
      title: "Smart Auto Replies",
      desc: "Engage your audience 24/7 with custom, context-aware auto-replies powered by DeepSeek AI."
    },
    {
      icon: <BarChart3 className="text-blue-500" size={24} />,
      title: "Deep Analytics",
      desc: "Visualize emotional distribution, tracking trends, category breakdowns, and performance analytics."
    },
    {
      icon: <Lock className="text-emerald-500" size={24} />,
      title: "Secure Google OAuth",
      desc: "Seamless, secure integration through Google's official API. Your account credentials are never exposed."
    }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white font-['Outfit'] relative overflow-x-hidden selection:bg-red-600/30 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[350px] h-[350px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#030303]/40 backdrop-blur-xl border-b border-white/[0.05] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-7 bg-[#ff0000] rounded-[8px] flex items-center justify-center shadow-lg shadow-red-900/30">
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
            </div>
            <div className="flex flex-col -gap-1">
              <span className="text-[17px] font-black tracking-tighter text-white">YOUTUBE</span>
              <span className="text-[10px] font-black text-red-500 tracking-[0.2em] -mt-1 uppercase">AI MODERATOR</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-[13px] font-bold text-white/80 hover:text-white transition-colors px-4 py-2"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/40 border border-red-500/20 text-red-400 rounded-full mb-6">
            <Sparkles size={13} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Advanced Creator Tools</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6 bg-gradient-to-r from-white via-white to-red-500 bg-clip-text text-transparent">
            YouTube AI Moderator
          </h1>
          <p className="text-[16px] sm:text-[19px] text-white/70 font-semibold leading-relaxed mb-10 max-w-2xl mx-auto">
            Take complete control of your comment section. Automate responses, filter out malicious spam, and understand sentiment using artificial intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              to="/register" 
              className="w-full sm:w-auto text-[14px] font-black bg-white hover:bg-white/90 text-black px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_12px_30px_-8px_rgba(255,255,255,0.15)] group"
            >
              Start Moderating Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto text-[14px] font-bold bg-white/[0.03] hover:bg-white/[0.07] text-white border border-white/10 px-8 py-3.5 rounded-xl transition-all flex items-center justify-center"
            >
              Sign In to Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Powerful Features for Modern Creators</h2>
          <p className="text-white/50 text-[13px] sm:text-[14px] font-semibold mt-2">Everything you need to moderate and grow your channel.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 rounded-[24px] p-6 transition-all duration-300 flex gap-4"
            >
              <div className="p-3 bg-white/[0.03] rounded-2xl h-fit border border-white/[0.05]">
                {f.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="text-white/60 text-xs sm:text-[13px] font-semibold leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Google OAuth & Data Usage Explanation (Google Verification Requirement) */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[32px] p-8 sm:p-10 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Lock size={120} />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
              <Eye size={16} />
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-blue-400">Data Access & Transparency</h2>
          </div>
          <div className="space-y-4 text-white/80 text-xs sm:text-[13px] font-semibold leading-relaxed">
            <p>
              To provide automated services, the <strong>YouTube AI Moderator</strong> requests permission to view and manage your YouTube comments and channel details via official Google OAuth APIs.
            </p>
            <ul className="space-y-2 list-disc list-inside pl-1 text-white/70">
              <li>We fetch comment threads on your connected videos to run our AI analysis.</li>
              <li>We process comments locally inside our secure API to determine sentiment (positive, neutral, toxic).</li>
              <li>We post replies or flag comments exclusively based on the Auto-Reply templates you define.</li>
              <li>We encrypt and store OAuth tokens securely. We never share your data with external third parties.</li>
            </ul>
            <p className="pt-2 border-t border-white/[0.05] text-[11px] text-white/50">
              By connecting your YouTube account, you authorize YouTube AI Moderator to perform actions on your behalf in compliance with Google's API policies. You can revoke this access at any time directly through your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">Google Security Settings <ExternalLink size={10} /></a>.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] bg-[#030303] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white/60 text-xs font-semibold">
            <span>&copy; {new Date().getFullYear()} YouTube AI Moderator.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold text-white/50">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
