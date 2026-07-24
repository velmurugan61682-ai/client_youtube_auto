import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Loader2, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Name is required.';
    }

    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email address is invalid.';
    }

    if (!formData.message.trim()) {
      tempErrors.message = 'Message is required.';
    } else if (formData.message.trim().length < 10) {
      tempErrors.message = 'Message must be at least 10 characters long.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    setTimeout(() => {
      setIsLoading(false);
      setShowRedirectMessage(true);

      const subject = encodeURIComponent(`ChannelMate Inquiry from ${formData.name.trim()}`);
      const body = encodeURIComponent(
        `Hello ChannelMate Support,\n\nI have an inquiry regarding the platform.\n\nName: ${formData.name.trim()}\nEmail: ${formData.email.trim()}\n\nMessage:\n${formData.message.trim()}\n\nRegards,\n${formData.name.trim()}`
      );

      // Trigger mailto fallback redirect
      window.location.href = `mailto:support@channelbot.in?subject=${subject}&body=${body}`;

      // Reset form fields
      setFormData({ name: '', email: '', message: '' });

      // Hide redirect message after 8 seconds
      setTimeout(() => setShowRedirectMessage(false), 8000);
    }, 1000);
  };

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
              <Mail size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Contact Support</h1>
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">We are here to help you scale</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Have Questions? Reach Out To Us
              </h2>
              <p className="text-xs text-[#606060] font-semibold leading-relaxed">
                Our support team is available to assist with channel setup, custom integrations, or billing inquiries. Submit the form to compose an email directly to us.
              </p>

              <div className="space-y-3 pt-4 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#ff0000] flex items-center justify-center border border-red-100/50"><Mail size={16} /></div>
                  <span>support@channelbot.in</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#ff0000] flex items-center justify-center border border-red-100/50"><Phone size={16} /></div>
                  <span>WhatsApp: +91 90474 84484</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleContactSubmit} className="space-y-4" noValidate>
              {showRedirectMessage && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold flex items-start gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    Your email application has been opened. Please send the email to complete your request.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className={`w-full glass-input py-2.5 px-4 text-xs font-bold outline-none border transition-colors ${errors.name ? 'border-red-500/80 bg-red-50/10' : 'border-[#e5e5e5] focus:border-[#ff0000]/50'
                    }`}
                />
                {errors.name && (
                  <p className="text-[10px] font-bold text-red-600 mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Your Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@gmail.com"
                  className={`w-full glass-input py-2.5 px-4 text-xs font-bold outline-none border transition-colors ${errors.email ? 'border-red-500/80 bg-red-50/10' : 'border-[#e5e5e5] focus:border-[#ff0000]/50'
                    }`}
                />
                {errors.email && (
                  <p className="text-[10px] font-bold text-red-600 mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Your Message</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you grow your channel?"
                  className={`w-full glass-input py-2.5 px-4 text-xs font-bold outline-none resize-none border transition-colors ${errors.message ? 'border-red-500/80 bg-red-50/10' : 'border-[#e5e5e5] focus:border-[#ff0000]/50'
                    }`}
                />
                {errors.message && (
                  <p className="text-[10px] font-bold text-red-600 mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-glass-primary w-full py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <><Send size={14} /> Compose Email</>}
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ContactPage;
