import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-[#f7f7f7] text-zinc-900 font-['Outfit'] relative overflow-x-hidden selection:bg-red-500/20 selection:text-red-900">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center select-none">
            <img src="/logo.png" className="h-9 w-auto object-contain" alt="ChannelMate Logo" />
          </Link>
          <Link
            to="/"
            className="text-[13px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1.5"
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
          className="bg-white border border-[#e5e5e5] rounded-[22px] p-6 sm:p-10 shadow-sm text-zinc-800"
        >
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-zinc-200/50">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-[#ff0000] border border-red-500/20 shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Terms of Service</h1>
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Last Updated: July 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-zinc-700 text-[13px] sm:text-[14px] font-semibold leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                1. Acceptance of Terms
              </h2>
              <p className="pl-3 text-zinc-650">
                By accessing or using ChannelMate, you agree to comply with and be bound by these Terms of Service. You own your YouTube data, and you authorize access only through Google OAuth when connecting your account. If you do not agree, you may not access or use the platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                2. YouTube API Terms & Policies
              </h2>
              <p className="pl-3 text-zinc-650">
                Our application integrates directly with YouTube API Services. Users authorize access through Google OAuth and can disconnect their YouTube account at any time from ChannelMate settings or revoke access from their Google Account. By using our service, you explicitly agree to be bound by:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-zinc-600">
                <li>
                  <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-[#ff0000] hover:underline inline-flex items-center gap-0.5">
                    YouTube Terms of Service <ExternalLink size={10} />
                  </a>
                </li>
                <li>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#ff0000] hover:underline inline-flex items-center gap-0.5">
                    Google Privacy Policy <ExternalLink size={10} />
                  </a>
                </li>
              </ul>
              <p className="pl-3 text-zinc-650">
                We utilize official Google APIs and do not bypass or override any limitations, rate limits, or policies established by Google or YouTube.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                3. User Account Responsibilities
              </h2>
              <p className="pl-3 text-zinc-650">
                You must register an account to access our automated dashboard. You agree to:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-zinc-600">
                <li>Provide accurate, current, and complete registration information.</li>
                <li>Maintain the confidentiality and security of your email and password.</li>
                <li>Accept full responsibility for all activities, moderation rules, and replies posted under your connected accounts.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                4. Moderation & Automated Reply Rules
              </h2>
              <p className="pl-3 text-zinc-650">
                ChannelMate provides tools for automated sentiment tracking, category auditing, and automatic replies. You are fully responsible for the auto-replies generated and posted. You must ensure your automated responses do not violate YouTube's spam, harassment, or community guidelines.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                5. Limitation of Liability
              </h2>
              <p className="pl-3 text-zinc-650">
                Under no circumstances shall ChannelMate or its creators be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of channel access, suspension by YouTube, data loss, or content flag actions resulting from automated activities.
              </p>
            </section>


            <section className="space-y-3 pt-6 border-t border-zinc-200/50">
              <h2 className="text-base font-bold text-zinc-900">Contact</h2>
              <p className="pl-3 text-zinc-500">
                If you have any questions regarding these Terms, please contact support at <span className="text-zinc-900">support@channelbot.in</span>.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TermsPage;

