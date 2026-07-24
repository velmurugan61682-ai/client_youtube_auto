import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';

const CONTACT_EMAIL = 'support@channelbot.in';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-base sm:text-lg font-black text-zinc-900">{title}</h2>
    <div className="space-y-3 text-sm font-semibold leading-relaxed text-zinc-650">{children}</div>
  </section>
);

const TermsPage = () => {
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
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-[#ff0000] border border-red-500/20 shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Terms of Service</h1>
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Last updated: July 24, 2026</p>
            </div>
          </div>

          <Section title="Agreement to These Terms">
            <p>
              These Terms of Service govern your access to and use of ChannelMate, a YouTube comment automation, moderation, engagement management, and analytics SaaS platform. By creating an account, connecting a YouTube channel, or using ChannelMate, you agree to these Terms and our Privacy Policy.
            </p>
          </Section>

          <Section title="Eligibility and Accounts">
            <p>
              You must be able to enter into a binding agreement and have authority to connect any YouTube channel you manage through ChannelMate. You are responsible for keeping your account credentials secure and for all activity under your account, including automation rules, moderation settings, and replies posted from your connected channels.
            </p>
          </Section>

          <Section title="Google and YouTube Access">
            <p>
              ChannelMate uses Google OAuth and YouTube API Services only after you authorize access. You can disconnect your YouTube channel in ChannelMate or revoke access from your Google Account permissions page at any time.
            </p>
            <p>
              Your use of connected YouTube features is also subject to the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-[#ff0000] hover:underline inline-flex items-center gap-1">YouTube Terms of Service <ExternalLink size={12} /></a>, the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#ff0000] hover:underline inline-flex items-center gap-1">Google Privacy Policy <ExternalLink size={12} /></a>, and applicable YouTube API policies.
            </p>
          </Section>

          <Section title="Acceptable Use">
            <p>You agree not to use ChannelMate to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post spam, scams, deceptive promotions, abusive content, harassment, hate speech, or unlawful content.</li>
              <li>Impersonate another person or misrepresent your relationship with a channel, brand, or viewer.</li>
              <li>Bypass YouTube rules, Google API restrictions, rate limits, security controls, or ChannelMate usage limits.</li>
              <li>Collect, export, or misuse viewer information in a way that violates law, platform policies, or viewer privacy.</li>
              <li>Interfere with the service, reverse engineer protected parts of the platform, or attempt unauthorized access.</li>
            </ul>
          </Section>

          <Section title="Automated Replies and Moderation">
            <p>
              ChannelMate provides tools that can recommend, queue, publish, hide, or log comment actions based on your settings and plan features. You remain responsible for your channel, your moderation choices, your automation rules, and any replies or actions performed through your account. You should review automation settings regularly and ensure your use complies with YouTube policies and applicable law.
            </p>
          </Section>

          <Section title="Subscriptions, Availability, and Changes">
            <p>
              Some ChannelMate features may require a paid plan or may be subject to usage limits. We may update, suspend, limit, or discontinue features as the product changes, as Google or YouTube API access changes, or as needed for security, reliability, compliance, or abuse prevention. We aim to keep the service available, but we do not guarantee uninterrupted or error-free operation.
            </p>
          </Section>

          <Section title="Service Limitations">
            <p>
              ChannelMate depends on Google OAuth, YouTube API availability, API quotas, channel permissions, network conditions, and your configuration. Comment syncing, analytics, moderation, and replies may be delayed, incomplete, unavailable, or rejected by YouTube. AI-generated content may be inaccurate or inappropriate, so you are responsible for reviewing settings and results.
            </p>
          </Section>

          <Section title="Intellectual Property">
            <p>
              ChannelMate and its software, design, branding, and documentation belong to ChannelMate or its licensors. You retain ownership of your YouTube channel content and data. You grant ChannelMate the limited rights needed to process that content and data only to provide the service.
            </p>
          </Section>

          <Section title="Termination">
            <p>
              You may stop using ChannelMate at any time and may revoke Google access or request data deletion as described in the Privacy Policy. We may suspend or terminate access if you violate these Terms, create risk for other users, misuse Google or YouTube data, fail to pay required fees, or use the service in a way that could harm ChannelMate, YouTube, Google, viewers, or third parties.
            </p>
          </Section>

          <Section title="Disclaimers and Limitation of Liability">
            <p>
              ChannelMate is provided on an "as is" and "as available" basis. To the maximum extent allowed by law, ChannelMate is not liable for indirect, incidental, consequential, special, punitive, or lost-profit damages, or for YouTube enforcement actions, channel restrictions, lost data, delayed API responses, or outcomes caused by your automation settings or use of the service.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about these Terms can be sent to <span className="font-black text-zinc-900">{CONTACT_EMAIL}</span>.
            </p>
          </Section>

          <div className="pt-6 border-t border-zinc-200/50 flex flex-wrap gap-4 text-sm font-bold">
            <Link to="/privacy" className="text-[#ff0000] hover:underline">Privacy Policy</Link>
            <Link to="/" className="text-zinc-500 hover:text-zinc-900">Back to ChannelMate</Link>
          </div>
        </article>
      </main>
    </div>
  );
};

export default TermsPage;
