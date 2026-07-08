import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-[#030303] text-white font-['Outfit'] relative overflow-x-hidden selection:bg-red-600/30 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#030303]/40 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 select-none">
            <div className="w-10 h-7 bg-[#ff0000] rounded-[8px] flex items-center justify-center">
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
            </div>
            <span className="text-[17px] font-black tracking-tighter text-white">YOUTUBE AI MOD</span>
          </Link>
          <Link 
            to="/" 
            className="text-[13px] font-bold text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-[32px] p-8 sm:p-12 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.05]">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">Terms of Service</h1>
              <p className="text-[11px] font-black text-white/40 uppercase tracking-widest mt-0.5">Last Updated: July 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-white/80 text-[13px] sm:text-[14px] font-semibold leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                1. Acceptance of Terms
              </h2>
              <p className="pl-3 text-white/70">
                By accessing or using the YouTube AI Moderator service, you agree to comply with and be bound by these Terms of Service. If you do not agree, you may not access or use the platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                2. YouTube API Terms & Policies
              </h2>
              <p className="pl-3 text-white/70">
                Our application integrates directly with YouTube API Services. By using our service, you explicitly agree to be bound by:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-white/70">
                <li>
                  <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">
                    YouTube Terms of Service <ExternalLink size={10} />
                  </a>
                </li>
                <li>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">
                    Google Privacy Policy <ExternalLink size={10} />
                  </a>
                </li>
              </ul>
              <p className="pl-3 text-white/70">
                We utilize official Google APIs and do not bypass or override any limitations, rate limits, or policies established by Google or YouTube.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                3. User Account Responsibilities
              </h2>
              <p className="pl-3 text-white/70">
                You must register an account to access our automated dashboard. You agree to:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-white/70">
                <li>Provide accurate, current, and complete registration information.</li>
                <li>Maintain the confidentiality and security of your email and password.</li>
                <li>Accept full responsibility for all activities, moderation rules, and replies posted under your connected accounts.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                4. Moderation & Automated Reply Rules
              </h2>
              <p className="pl-3 text-white/70">
                YouTube AI Moderator provides tools for automated sentiment tracking, category auditing, and automatic replies. You are fully responsible for the auto-replies generated and posted. You must ensure your automated responses do not violate YouTube's spam, harassment, or community guidelines.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                5. Limitation of Liability
              </h2>
              <p className="pl-3 text-white/70">
                Under no circumstances shall YouTube AI Moderator or its creators be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of channel access, suspension by YouTube, data loss, or content flag actions resulting from automated activities.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-white/[0.05]">
              <h2 className="text-base font-bold text-white">Contact</h2>
              <p className="pl-3 text-white/60">
                If you have any questions regarding these Terms, please contact support at <span className="text-white">support@youtubeai.test</span>.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TermsPage;
