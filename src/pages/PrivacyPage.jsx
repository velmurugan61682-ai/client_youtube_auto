import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';

const CONTACT_EMAIL = 'support@channelbot.in';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-base sm:text-lg font-black text-zinc-900">{title}</h2>
    <div className="space-y-3 text-sm font-semibold leading-relaxed text-zinc-650">{children}</div>
  </section>
);

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#f7f7f7] text-zinc-900 font-['Outfit'] relative overflow-x-hidden selection:bg-red-500/20 selection:text-red-900">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 select-none min-w-0">
            <img src="/brand-logo.png" className="h-9 w-auto object-contain" alt="ChannelMate Logo" />
            <div className="flex flex-col items-start leading-none min-w-0">
              <span className="text-base font-black tracking-tight text-zinc-900">ChannelMate</span>
              <span className="text-[9px] font-semibold text-zinc-500 mt-0.5">AI-powered YouTube Comment Automation</span>
            </div>
          </Link>
          <Link to="/" className="text-[13px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1.5 shrink-0">
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <article className="bg-white border border-[#e5e5e5] rounded-[22px] p-6 sm:p-10 shadow-sm text-zinc-800 space-y-8">
          <div className="flex items-center gap-3 pb-6 border-b border-zinc-200/50">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Privacy Policy</h1>
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Last updated: July 24, 2026</p>
            </div>
          </div>

          <Section title="Overview">
            <p>
              ChannelMate is a SaaS tool for YouTube creators, businesses, and agencies that helps automate comment replies, moderate comments, manage engagement, and understand channel performance. This policy explains what information ChannelMate collects, why we need it, how long we keep it, and how you can control or delete it.
            </p>
          </Section>

          <Section title="Information We Collect">
            <p>When you create an account or connect a YouTube channel through Google OAuth and the YouTube Data API, ChannelMate may collect or access:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account details such as your name, email address, profile image, login status, plan, and account settings.</li>
              <li>YouTube channel data such as channel ID, channel name, thumbnail, subscriber or engagement counts available through authorized API access, and connection status.</li>
              <li>YouTube video metadata such as video IDs, titles, descriptions, thumbnails, publish dates, and engagement metrics needed to organize comments and analytics.</li>
              <li>YouTube comments and comment metadata, including comment text, comment IDs, authors, timestamps, moderation state, reply status, and related video information.</li>
              <li>YouTube analytics and engagement data that you authorize, used to show dashboard reports and measure moderation or reply activity.</li>
              <li>OAuth tokens issued by Google so ChannelMate can access YouTube API features you authorize. Tokens are stored encrypted and are not your Google password.</li>
              <li>Operational logs such as moderation actions, automated reply history, channel sync status, errors, and security audit events needed to run and support the service.</li>
            </ul>
          </Section>

          <Section title="Why We Use This Information">
            <p>ChannelMate uses this data only to provide the product features you request or configure:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To fetch YouTube comments so they can be reviewed, filtered, moderated, and answered.</li>
              <li>To generate and publish automated replies according to your rules and account settings.</li>
              <li>To detect spam, scam, abusive, toxic, or harmful comments and support moderation workflows.</li>
              <li>To organize comments by channel and video so you can manage engagement efficiently.</li>
              <li>To show analytics, reports, reply history, moderation logs, and engagement summaries in your dashboard.</li>
              <li>To secure your account, troubleshoot errors, prevent misuse, and provide customer support.</li>
            </ul>
          </Section>

          <Section title="No Sale or Third-Party Sharing">
            <p>
              ChannelMate does not sell, rent, trade, or share your Google user data, YouTube channel data, comments, video metadata, analytics data, or OAuth tokens with third parties for advertising, resale, profiling, or unrelated purposes. We use the information only to operate and improve the ChannelMate features visible in the service.
            </p>
          </Section>

          <Section title="Google API Data and Limited Use">
            <p>
              ChannelMate's use and transfer of information received from Google APIs follows the Google API Services User Data Policy, including the Limited Use requirements. We do not use Google user data for ads, retargeting, credit checks, or unrelated product analytics.
            </p>
          </Section>

          <Section title="Data Retention">
            <p>
              We keep account records, connected channel records, OAuth tokens, cached comments, video metadata, analytics snapshots, moderation logs, and reply logs while your ChannelMate account or YouTube channel connection is active and the information is needed to provide the service.
            </p>
            <p>
              If you disconnect a YouTube channel, we delete stored OAuth tokens for that channel and stop syncing new YouTube data. Cached operational records tied to the channel, such as moderation and reply logs, are removed from active systems within a reasonable period unless we must keep limited records for security, fraud prevention, dispute resolution, legal compliance, or backup recovery.
            </p>
            <p>
              Backup copies may remain for a limited backup-retention period before they are overwritten or deleted. They are not used for normal product activity after deletion is requested.
            </p>
          </Section>

          <Section title="Your Controls: Revoke Access or Delete Data">
            <ul className="list-disc pl-6 space-y-2">
              <li>You can disconnect a YouTube channel from ChannelMate settings when you no longer want the service to access that channel.</li>
              <li>You can revoke Google OAuth access at any time from your Google Account permissions page: <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-[#ff0000] hover:underline inline-flex items-center gap-1">https://myaccount.google.com/permissions <ExternalLink size={12} /></a>.</li>
              <li>To request deletion of your ChannelMate account or stored YouTube data, email <span className="font-black text-zinc-900">{CONTACT_EMAIL}</span> from the email address associated with your account and include the channel name or account email you want deleted.</li>
            </ul>
          </Section>

          <Section title="Security">
            <p>
              We use technical and organizational safeguards designed to protect your data, including HTTPS in transit, encrypted OAuth token storage, access controls, and audit logging. No online system can be guaranteed to be perfectly secure, but we limit access to the data needed to operate ChannelMate.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions, privacy requests, OAuth revocation questions, and deletion requests can be sent to <span className="font-black text-zinc-900">{CONTACT_EMAIL}</span>.
            </p>
          </Section>

          <div className="pt-6 border-t border-zinc-200/50 flex flex-wrap gap-4 text-sm font-bold">
            <Link to="/terms" className="text-[#ff0000] hover:underline">Terms of Service</Link>
            <Link to="/" className="text-zinc-500 hover:text-zinc-900">Back to ChannelMate</Link>
          </div>
        </article>
      </main>
    </div>
  );
};

export default PrivacyPage;
