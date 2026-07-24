import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const GooglePermissionsPage = () => {
  const scopes = [
    {
      name: 'openid',
      title: 'OpenID Connect ID Token',
      access: 'Read-only',
      description: 'Used to securely verify the user identity and map the user account inside the system database using Google SSO.',
      feature: 'User Sign-in / Identity Mapping'
    },
    {
      name: 'email',
      title: 'User Email Address',
      access: 'Read-only',
      description: 'Used to view the primary email address linked to the Google account to establish login credentials and send important channel alerts.',
      feature: 'Account Identification & Alerts'
    },
    {
      name: 'profile',
      title: 'Google Profile Information',
      access: 'Read-only',
      description: 'Used to display basic user details (e.g., name and profile picture) to personalize the creator dashboard experience.',
      feature: 'Creator Profile View'
    },
    {
      name: 'https://www.googleapis.com/auth/youtube.readonly',
      title: 'YouTube Read-Only Data',
      access: 'Read-only',
      description: 'Used to retrieve YouTube channel metadata (channel title, subscriber counts), retrieve comment threads, and compile sentiment logs on the dashboard.',
      feature: 'Audience Sentiment Analysis, Dashboard Telemetry'
    },
    {
      name: 'https://www.googleapis.com/auth/youtube.force-ssl',
      title: 'YouTube Account Management (SSL)',
      access: 'Read & Manage (Data API)',
      description: 'Read and manage YouTube account data permitted by the YouTube Data API. ChannelMate uses this scope to retrieve comments required for moderation workflows, post replies on behalf of the connected channel, apply supported moderation actions to comments, and manage YouTube resources only when initiated or configured by the authorized user.',
      feature: 'AI Auto-Replies, Automated Spam & Toxicity Moderation'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-zinc-900 font-['Outfit'] relative overflow-x-hidden selection:bg-red-500/20 selection:text-red-900">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 select-none">
            <img src="/channelmate_logo.png" className="h-9 w-auto object-contain" alt="ChannelMate Logo" />
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
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-[#e5e5e5] rounded-[22px] p-6 sm:p-10 shadow-sm text-zinc-800"
        >
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-zinc-200/50">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-[#ff0000] border border-red-500/20 shadow-sm">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Google OAuth Permissions & Scopes</h1>
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Transparency & Compliance Directory</p>
            </div>
          </div>

          <div className="space-y-6 text-zinc-700 text-[13px] sm:text-[14px] font-semibold leading-relaxed">
            <p className="text-zinc-650 mb-6 font-medium">
              ChannelMate integrates securely with Google APIs using the OAuth 2.0 protocol. We request only the absolute minimum permissions needed to deliver comment replies and moderation services. Your channel data is never accessed without consent, and you can revoke access at any time.
            </p>

            <div className="space-y-6">
              {scopes.map((scope, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-[#e5e5e5] bg-[#fdfdfd] hover:bg-white transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <code className="text-xs font-bold text-[#ff0000] break-all bg-red-50/50 px-2 py-1 rounded-md border border-red-100/40">
                      {scope.name}
                    </code>
                    <span className={`self-start text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${scope.access === 'Read-only'
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                      {scope.access}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-black text-zinc-900 mb-1">{scope.title}</h3>
                    <p className="text-xs text-zinc-500 font-semibold leading-relaxed">{scope.description}</p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-2 border-t border-zinc-100 text-[11px] font-bold text-zinc-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      Feature: <strong className="text-zinc-755">{scope.feature}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <section className="mt-10 pt-8 border-t border-zinc-200/50 space-y-4">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Lock size={16} className="text-[#ff0000]" />
                How to Revoke Permissions
              </h2>
              <p className="text-zinc-650 font-medium">
                You maintain complete control over your Google Account and YouTube channels. If you wish to disconnect ChannelMate:
              </p>
              <ul className="list-decimal pl-6 space-y-2 text-zinc-650">
                <li>You can disconnect any YouTube channel from the <strong>Settings</strong> page inside the ChannelMate dashboard, which immediately deletes the stored access and refresh tokens.</li>
                <li>You can completely revoke the app's authorization directly from your Google Account's secure panel by visiting the <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-[#ff0000] hover:underline font-bold">Google Third-Party Access Security Page</a>.</li>
              </ul>
            </section>

            <section className="pt-6 border-t border-zinc-200/50">
              <p className="text-zinc-400 text-xs font-semibold">
                For additional questions or technical support regarding OAuth integrations, please contact our security team at <span className="text-zinc-900 font-bold">support@channelbot.in</span>.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default GooglePermissionsPage;
