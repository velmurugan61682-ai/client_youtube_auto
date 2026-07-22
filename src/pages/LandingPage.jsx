import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  PlaySquare,
  Users,
  Activity,
  TrendingUp,
  ThumbsUp,
  Bot,
  Building,
  GraduationCap,
  Layers,
  Heart,
  Send,
  Mail,
  User,
  Star,
  Check,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import HumanAiAutomationShowcase from '../components/HumanAiAutomationShowcase';


// Landing page
const LandingPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // Handle active section on scroll
  useEffect(() => {
    const sections = ['home', 'automation-showcase', 'about', 'use-cases', 'features', 'testimonials', 'pricing', 'contact'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      setContactSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setContactSubmitted(false), 5000);
    }, 800);
  };

  const useCases = [
    {
      icon: <PlaySquare size={26} />,
      title: "YouTube Creators",
      desc: "Automate viewer comment replies, filter spam instantly, and keep your video comment section clean 24/7."
    },
    {
      icon: <Building size={26} />,
      title: "Businesses & Brands",
      desc: "Automatically capture leads from video inquiries directly to WhatsApp and your CRM pipeline."
    },
    {
      icon: <Layers size={26} />,
      title: "Agencies",
      desc: "Manage multiple client YouTube channels under a unified SaaS dashboard with role-based access."
    },
    {
      icon: <GraduationCap size={26} />,
      title: "Education Creators",
      desc: "Instantly answer recurring student course questions with intelligent DeepSeek AI contextual replies."
    }
  ];

  const features = [
    { icon: <MessageSquare size={22} />, title: "AI Comment Replies", desc: "Contextual 24/7 automated replies powered by DeepSeek AI." },
    { icon: <ShieldCheck size={22} />, title: "Auto Moderation", desc: "Real-time automated comment filtering and toxicity detection." },
    { icon: <Lock size={22} />, title: "Toxic Comment Protection", desc: "Instantly hide or delete abusive comments before viewers see them." },
    { icon: <Users size={22} />, title: "Lead Capture", desc: "Extract viewer phone numbers & leads directly from comments." },
    { icon: <BarChart3 size={22} />, title: "YouTube Analytics", desc: "Deep audience sentiment analysis and growth telemetry." },
    { icon: <ThumbsUp size={22} />, title: "Auto Like Automation", desc: "Auto-like positive viewer comments to boost channel engagement." },
    { icon: <Layers size={22} />, title: "Multi-Channel Management", desc: "Connect and manage multiple YouTube channels effortlessly." },
    { icon: <Sparkles size={22} />, title: "AI-Powered Insights", desc: "Actionable audience perception reports and trends." }
  ];

  const testimonials = [
    {
      quote: "ChannelMate saved me over 15 hours every week moderating toxic comments and answering price inquiries on my tech channel!",
      name: "Vaseegrah Dev",
      role: "Tech Creator (250K+ Subs)",
      rating: 5
    },
    {
      quote: "We captured over 500 high-intent WhatsApp leads directly from our product video comments in the first 30 days.",
      name: "Ananya Sharma",
      role: "SaaS Marketing Director",
      rating: 5
    },
    {
      quote: "Managing 12 client YouTube channels used to be chaos. ChannelMate brought complete automation and clean analytics.",
      name: "Rohan Verma",
      role: "Digital Media Agency Owner",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free Plan",
      price: "₹0",
      period: "Free 14 Days",
      desc: "Perfect for exploring AI comment moderation.",
      features: ["1 YouTube Channel", "Up to 500 AI Replies/mo", "Basic Toxicity Filter", "Community Support"],
      cta: "Start Free Trial",
      highlight: false
    },
    {
      name: "Pro Plan",
      price: "₹999",
      period: "per 3 months",
      desc: "Complete AI comment moderation & lead capture for growing channels.",
      features: ["Up to 3 YouTube Channels", "Unlimited AI Auto-Replies", "Advanced Auto-Liking", "Lead Export to CSV/CRM", "24/7 Priority Support"],
      cta: "Subscribe Now",
      highlight: true
    }
  ];

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'automation-showcase', label: 'Human + AI Workflow' },
    { id: 'about', label: 'About' },
    { id: 'use-cases', label: 'Use Cases' },
    { id: 'features', label: 'Features' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'contact', label: 'Contact' }
  ];


  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#0f0f0f] font-['Outfit'] relative overflow-x-hidden selection:bg-red-500/20 selection:text-red-900 scroll-smooth">

      {/* 1. Sticky Floating Glass Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center select-none cursor-pointer" onClick={() => scrollToSection('home')}>
            <img src="/channelmate_logo.png" className="h-10 sm:h-11 w-auto object-contain" alt="Channelmate Logo" />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#f2f2f2] p-1 rounded-full border border-[#e5e5e5]">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeSection === link.id
                    ? 'bg-[#0f0f0f] text-white shadow-sm'
                    : 'text-[#606060] hover:text-[#0f0f0f] hover:bg-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="text-xs font-bold text-[#0f0f0f] hover:text-[#ff0000] transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="btn-glass-primary text-xs px-5 py-2.5 shadow-red-500/25 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 1: HOME (HERO) */}
      <section id="home" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#e5e5e5] text-[#0f0f0f] rounded-full mb-7 shadow-sm">
            <Sparkles size={14} className="animate-pulse text-[#ff0000]" />
            <span className="text-[11px] font-black uppercase tracking-widest">YouTube Creator Automation Studio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] mb-6 text-[#0f0f0f]">
            Automate, Moderate & Grow Your YouTube Channel with{' '}
            <span className="text-[#ff0000]">
              Channelmate
            </span>
          </h1>

          <p className="text-[16px] sm:text-[18px] text-[#606060] font-semibold leading-relaxed mb-10 max-w-2xl mx-auto">
            Channelmate is an AI-powered platform that helps YouTube creators automatically moderate comments, detect spam, generate intelligent AI replies, analyze audience sentiment, and securely manage their channels.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/register" className="btn-glass-primary w-full sm:w-auto text-[15px] px-8 py-3.5 shadow-lg group">
              Start Free Trial
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button onClick={() => scrollToSection('automation-showcase')} className="btn-glass-secondary w-full sm:w-auto text-[15px] px-8 py-3.5">
              Watch AI & Creator Demo
            </button>
          </div>
        </motion.div>

        {/* AI Generated Talking Hero Image Showcase Banner */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="max-w-5xl mx-auto mb-10 rounded-2xl overflow-hidden border border-[#e5e5e5] shadow-sm relative group bg-white">
          <img src="/yt_human_male_ai_talking.png" alt="Male YouTube Creator Talking with AI Co-Pilot" className="w-full h-[320px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/90 via-[#0f0f0f]/30 to-transparent p-6 sm:p-10 flex flex-col justify-end text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#ff0000] text-white border border-[#ff0000] text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                AI Generated Visual Showcase
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                Male Creator &amp; AI Co-Pilot
              </span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-white max-w-2xl leading-tight">
              Human Strategy Meets 24/7 AI YouTube Channel Automation
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-200 mt-2 max-w-xl">
              Talk directly with Channelmate AI Co-Pilot to automatically answer viewer comments, purge spam, and turn video interactions into WhatsApp leads.
            </p>
          </div>
        </motion.div>


        {/* Dashboard Preview */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="max-w-5xl mx-auto glass-garden-card p-5 sm:p-6 rounded-2xl text-left border-[#e5e5e5] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fff1f1] flex items-center justify-center text-[#ff0000] border border-red-100">
                <PlaySquare size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Tech Channel Creator Hub</h3>
                <p className="text-xs font-semibold text-[#ff0000] flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff0000] animate-pulse" />
                  YouTube Connected & Verified
                </p>
              </div>
            </div>
            <div className="yt-badge yt-badge-success">Active Shielding ON</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#e5e5e5] shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscribers</p>
              <p className="text-2xl font-black text-slate-900 mt-1">45,820</p>
              <span className="text-[11px] font-bold text-[#ff0000] flex items-center gap-0.5 mt-1"><TrendingUp size={12} /> +12% this month</span>
            </div>
            <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#e5e5e5] shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Replies Sent</p>
              <p className="text-2xl font-black text-slate-900 mt-1">3,420</p>
              <span className="text-[11px] font-bold text-[#ff0000] flex items-center gap-0.5 mt-1"><CheckCircle size={12} /> 99.4% Accuracy</span>
            </div>
            <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#e5e5e5] shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spam Purged</p>
              <p className="text-2xl font-black text-slate-900 mt-1">890</p>
              <span className="text-[11px] font-bold text-[#ff0000] flex items-center gap-0.5 mt-1"><ShieldCheck size={12} /> Zero False Positives</span>
            </div>
            <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#e5e5e5] shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp Leads</p>
              <p className="text-2xl font-black text-slate-900 mt-1">540</p>
              <span className="text-[11px] font-bold text-[#ff0000] flex items-center gap-0.5 mt-1"><Users size={12} /> High Value</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION: HUMAN + AI AUTOMATION SHOWCASE */}
      <section id="automation-showcase" className="relative z-10 py-8 border-t border-[#e5e5e5]">
        <HumanAiAutomationShowcase />
      </section>

      {/* SECTION 2: ABOUT */}

      <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-16">
          <span className="text-xs font-black text-[#ff0000] uppercase tracking-widest bg-[#fff1f1] px-4 py-1.5 rounded-full">
            About ChannelMate
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0f0f0f]">
            Intelligent Automation Built for Creators & Brands
          </h2>
          <p className="text-[#606060] font-semibold text-base sm:text-lg leading-relaxed">
            Our mission is to empower YouTube creators by eliminating manual comment moderation, capturing valuable audience leads, and maintaining positive viewer communities automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-garden-card p-8 rounded-2xl space-y-3">
            <div className="icon-badge-green"><Bot size={24} /></div>
            <h3 className="text-lg font-bold text-slate-900">DeepSeek AI Engine</h3>
            <p className="text-xs text-[#606060] font-semibold leading-relaxed">
              Trained on Millions of YouTube comment threads to generate authentic, context-aware responses tailored to your brand voice.
            </p>
          </div>
          <div className="glass-garden-card p-8 rounded-2xl space-y-3">
            <div className="icon-badge-green"><ShieldCheck size={24} /></div>
            <h3 className="text-lg font-bold text-slate-900">Real-Time Shielding</h3>
            <p className="text-xs text-[#606060] font-semibold leading-relaxed">
              Detects toxic remarks, hate speech, external spam links, and competitor promos before they damage your video reach.
            </p>
          </div>
          <div className="glass-garden-card p-8 rounded-2xl space-y-3">
            <div className="icon-badge-green"><TrendingUp size={24} /></div>
            <h3 className="text-lg font-bold text-slate-900">Automated Growth</h3>
            <p className="text-xs text-[#606060] font-semibold leading-relaxed">
              Converts video interactions into CRM leads while auto-liking positive comments to boost algorithmic engagement.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: USE CASES */}
      <section id="use-cases" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-[#e5e5e5]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black text-[#ff0000] uppercase tracking-widest bg-[#fff1f1] px-4 py-1.5 rounded-full">
            Tailored Solutions
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0f0f0f] mt-4">
            Designed for Every Creator Workflow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {useCases.map((uc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-garden-card p-8 rounded-2xl flex gap-6"
            >
              <div className="icon-badge-green shrink-0">{uc.icon}</div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">{uc.title}</h3>
                <p className="text-xs text-[#606060] font-semibold leading-relaxed">{uc.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4: FEATURES */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-[#e5e5e5]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black text-[#ff0000] uppercase tracking-widest bg-[#fff1f1] px-4 py-1.5 rounded-full">
            Complete Feature Suite
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0f0f0f] mt-4">
            Everything You Need to Scale
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="glass-garden-card p-6 rounded-xl space-y-3 hover:border-[#d9d9d9] transition-all">
              <div className="icon-badge-green !w-10 !h-10">{f.icon}</div>
              <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: TESTIMONIALS */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-[#e5e5e5]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black text-[#ff0000] uppercase tracking-widest bg-[#fff1f1] px-4 py-1.5 rounded-full">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0f0f0f] mt-4">
            Loved by 5,000+ Creators & Agencies
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="glass-garden-card p-8 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 font-semibold italic leading-relaxed">"{t.quote}"</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-black text-slate-900">{t.name}</p>
                <p className="text-[10px] font-bold text-[#ff0000]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: PRICING */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-[#e5e5e5]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black text-[#ff0000] uppercase tracking-widest bg-[#fff1f1] px-4 py-1.5 rounded-full">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0f0f0f] mt-4">
            Simple, Transparent Subscription Plans
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-8">
          {pricingPlans.map((p, i) => (
            <div 
              key={i} 
              className={`glass-garden-card p-8 rounded-2xl flex flex-col justify-between relative ${
                p.highlight ? 'border-2 border-[#ff0000] shadow-sm bg-white' : ''
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#ff0000] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div>
                <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">{p.desc}</p>

                <div className="my-6">
                  <span className="text-3xl font-black text-slate-900">{p.price}</span>
                  <span className="text-xs text-slate-400 font-bold ml-1">/ {p.period}</span>
                </div>

                <ul className="space-y-2.5 mb-8">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Check size={14} className="text-[#ff0000] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/register"
                className={`w-full text-center text-xs py-3 rounded-full font-bold transition-all ${
                  p.highlight ? 'btn-glass-primary' : 'btn-glass-secondary'
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: CONTACT */}
      <section id="contact" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto glass-garden-card p-8 sm:p-12 rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <span className="text-xs font-black text-[#ff0000] uppercase tracking-widest bg-[#fff1f1] px-4 py-1.5 rounded-full">
                Get In Touch
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
                Have Questions? Reach Out To Us
              </h2>
              <p className="text-xs text-[#606060] font-semibold leading-relaxed">
                Our support team is available 24/7 to assist with channel setup, custom agency integrations, or billing inquiries.
              </p>

              <div className="space-y-3 pt-4 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="icon-badge-green !w-9 !h-9"><Mail size={16} /></div>
                  <span>support@channelmate.ai</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="icon-badge-green !w-9 !h-9"><Bot size={16} /></div>
                  <span>Global AI Automation Systems</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleContactSubmit} className="space-y-4">
              {contactSubmitted && (
                <div className="p-3 bg-[#fff1f1] text-[#cc0000] border border-red-100 rounded-xl text-xs font-bold">
                  Thank you! Your message has been sent successfully.
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Vaseegrah Dev"
                  className="w-full glass-input py-2.5 px-4 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full glass-input py-2.5 px-4 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Your Message</label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you grow your channel?"
                  className="w-full glass-input py-2.5 px-4 text-xs font-bold outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={contactLoading}
                className="btn-glass-primary w-full py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {contactLoading ? <Loader2 className="animate-spin" size={16} /> : <><Send size={14} /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#e5e5e5] bg-white/50 backdrop-blur-xl py-12 text-[#606060]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span>&copy; {new Date().getFullYear()} Channelmate AI.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
            <Link to="/privacy" className="hover:text-[#ff0000] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#ff0000] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;



