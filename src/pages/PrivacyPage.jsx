import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#f7f7f7] text-zinc-900 font-['Outfit'] relative overflow-x-hidden selection:bg-red-500/20 selection:text-red-900">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 select-none">
            <img src="/brand-logo.png" className="h-9 w-auto object-contain" alt="ChannelMate Logo" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-base font-black tracking-tight text-zinc-900">ChannelMate</span>
              <span className="text-[9px] font-semibold text-zinc-500 mt-0.5">YouTube Creators</span>
            </div>
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
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Privacy Policy</h1>
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Last Updated: July 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-zinc-700 text-[13px] sm:text-[14px] font-semibold leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                1. Overview
              </h2>
              <p className="pl-3 text-zinc-650">
                ChannelMate ("we", "our", or "us") provides comment analytics, auto-moderation, and AI-powered reply tools for YouTube creators and businesses. This Privacy Policy outlines how we access, collect, process, store, and secure your personal profile data and YouTube channel data once you authorize access via Google OAuth 2.0 and the YouTube Data API. We are committed to maintaining the highest privacy standards and complying with Google’s API policies.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                2. Data We Access & Collect
              </h2>
              <p className="pl-3 text-zinc-650">
                To perform YouTube comment auto-replies and toxicity moderations, ChannelMate accesses only the specific data categories you authorize through Google OAuth. This includes:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-zinc-650">
                <li><strong>User Profile Data:</strong> Your name, email address, and profile photo, accessed via basic scopes (openid, email, profile) to create, secure, and customize your ChannelMate account.</li>
                <li><strong>YouTube Channel Metadata:</strong> Channel names, titles, custom subscriber statistics, and video logs, used to generate analytics and telemetry in your dashboard.</li>
                <li><strong>YouTube Videos & Comments:</strong> The text, author metadata, timestamps, and reaction metrics of comments left on your public videos. This is required to process automated AI replies and filter toxic messages.</li>
                <li><strong>OAuth Tokens:</strong> Encrypted Google OAuth access and refresh tokens, which allow our backend workers to securely authenticate with YouTube APIs to fetch comments and post replies on your behalf.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                3. How We Use Your Data
              </h2>
              <p className="pl-3 text-zinc-650">
                Your data is used strictly to power features within your private ChannelMate dashboard:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-zinc-650">
                <li>Fetching comments to analyze sentiment and flag spam or harmful words.</li>
                <li>Posting automatic context-aware replies generated by DeepSeek AI based on rules you create.</li>
                <li>Compiling sentiment reports, telemetry graphs, and moderator logs.</li>
                <li><strong>No Selling or Sharing:</strong> We do not sell, rent, or share your profile or YouTube channel data with third parties. Data is used exclusively to deliver the automation services you configure.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                4. Data Storage & Encryption
              </h2>
              <p className="pl-3 text-zinc-650">
                We utilize strict industry-standard measures to keep your data secure:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-zinc-650">
                <li><strong>Data in Transit:</strong> All communication between the browser, ChannelMate servers, and YouTube API endpoints is secured using SSL/TLS encryption.</li>
                <li><strong>Data at Rest:</strong> Sensitive authentication tokens (Google OAuth credentials) are stored securely on our database servers using strong AES-256-CBC encryption.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                5. Google API Services User Data Policy Compliance
              </h2>
              <p className="pl-3 text-zinc-650 font-semibold text-[#ff0000]">
                ChannelMate's use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.
              </p>
              <p className="pl-3 text-zinc-650">
                We strictly limit our access to and usage of Google API user data to providing and improving the comment automation and moderation tools visible on the user's dashboard. We do not use this data for serving advertisements, retargeting, profiling, or database resale under any circumstances.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                6. Data Retention, Disconnection & Deletion
              </h2>
              <p className="pl-3 text-zinc-650">
                You maintain complete ownership of your YouTube account and data. We store your tokens and cached comments only for the duration of your active channel connection:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-zinc-650">
                <li><strong>YouTube Channel Disconnection:</strong> You can disconnect your YouTube channel at any time in the settings tab of your dashboard. Disconnecting a channel immediately deletes all associated OAuth access tokens, refresh tokens, and cached comment logs from our active databases.</li>
                <li><strong>Account Deletion:</strong> You can request complete deletion of your ChannelMate creator account. Upon deletion, all of your user profile details, database logs, and credentials are permanently purged.</li>
                <li><strong>Google Permissions Revocation:</strong> You can instantly revoke all access rights granted to ChannelMate by visiting the secure <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-[#ff0000] hover:underline font-bold inline-flex items-center gap-0.5">Google Security Permissions Panel <ExternalLink size={11} /></a>.</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-zinc-200/50">
              <h2 className="text-base font-bold text-zinc-900">Contact Us</h2>
              <p className="pl-3 text-zinc-500">
                If you have questions about this Privacy Policy, your data storage, or Google OAuth compliance, please reach out to us at <span className="text-zinc-900 font-bold">support@channelbot.in</span>.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PrivacyPage;

