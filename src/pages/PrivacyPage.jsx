import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, FileText, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
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
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">Privacy Policy</h1>
              <p className="text-[11px] font-black text-white/40 uppercase tracking-widest mt-0.5">Last Updated: July 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-white/80 text-[13px] sm:text-[14px] font-semibold leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                1. Overview
              </h2>
              <p className="pl-3 text-white/70">
                YouTube AI Moderator ("we", "our", or "us") provides comment analytics, toxic comment moderation, and auto-reply tools for creators. This Privacy Policy details how we access, collect, store, and process your personal and channel data when you use our website and services, specifically through Google APIs.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                2. Data We Access & Collect
              </h2>
              <p className="pl-3 text-white/70">
                To enable automated AI comment moderation, we require access to specific YouTube and Google user data using official Google OAuth scopes. We collect:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-white/70">
                <li><strong>Profile Details:</strong> Your name, email address, and profile picture, used strictly for user identification and account security.</li>
                <li><strong>YouTube Comments:</strong> Comment text, author names, timestamps, and statistics for your connected channels. This is necessary to perform AI toxicity analysis and auto-replies.</li>
                <li><strong>Channel Metadata:</strong> YouTube channel titles, subscriber counts, and video lists, used to compile dashboard analytics.</li>
                <li><strong>OAuth Tokens:</strong> Encrypted Google OAuth access and refresh tokens, stored securely to communicate with YouTube APIs on your behalf.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                3. How We Use Your Data
              </h2>
              <p className="pl-3 text-white/70">
                We strictly use your YouTube and profile data to deliver and improve our platform features:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-white/70">
                <li>Fetching comments to categorize their emotional sentiment (positive, neutral, toxic).</li>
                <li>Executing auto-replies and moderation rules set up explicitly by you.</li>
                <li>Generating insights, trends, and logs displayed on your private creator dashboard.</li>
                <li>We <strong>do not</strong> sell or share your data with third parties. All processing is strictly confined to delivering services to your account.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                4. Data Storage & Encryption
              </h2>
              <p className="pl-3 text-white/70">
                Security is our highest priority. All communication between our website, backend servers, and YouTube API uses SSL/TLS encryption. All authentication tokens (Google OAuth credentials) are stored using state-of-the-art AES-256 encryption at rest.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                5. User Control & Access Revocation
              </h2>
              <p className="pl-3 text-white/70">
                You retain absolute ownership and control over your YouTube channel and data. You can disconnect your YouTube channels or delete your account at any time in the settings tab, which will purge all stored data from our database.
              </p>
              <p className="pl-3 text-white/70">
                Additionally, you can instantly revoke our application's access rights directly through the <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">Google Security Permissions Page <ExternalLink size={11} /></a>.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-white/[0.05]">
              <h2 className="text-base font-bold text-white">Contact Us</h2>
              <p className="pl-3 text-white/60">
                If you have any questions about this Privacy Policy or your data usage, please reach out to us at <span className="text-white">support@youtubeai.test</span>.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PrivacyPage;
