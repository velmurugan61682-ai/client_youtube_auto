import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  PlaySquare, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  ShieldAlert,
  Loader2,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';

const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminMetrics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setMetrics(res.data.metrics);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Registered Clients', value: metrics?.totalClients || 0, icon: Users, color: 'emerald', change: '+14% this month' },
    { title: 'Active Subscribers', value: metrics?.activeSubscribers || 0, icon: CreditCard, color: 'green', change: 'Live Accounts' },
    { title: 'Expired Subscribers', value: metrics?.expiredSubscribers || 0, icon: ShieldAlert, color: 'amber', change: 'Requires Outreach' },
    { title: 'Connected Channels', value: metrics?.connectedChannels || 0, icon: PlaySquare, color: 'teal', change: 'OAuth Connected' },
    { title: 'Total AI Replies Sent', value: metrics?.totalAiReplies || 0, icon: MessageSquare, color: 'blue', change: 'Automated 24/7' },
    { title: 'WhatsApp Leads Captured', value: metrics?.totalLeads || 0, icon: TrendingUp, color: 'emerald', change: 'High Conversion' },
    { title: 'Monthly Revenue (INR)', value: `₹${(metrics?.monthlyRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'green', change: 'Razorpay Verified' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-garden-card p-6 rounded-[28px] bg-gradient-to-r from-emerald-500/10 via-white to-green-500/10 border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full">
            Single-Admin SaaS Command Hub
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Executive Overview</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Real-time telemetry and MongoDB database analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="icon-badge-green">
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((c, i) => {
          const IconComp = c.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-garden-card p-6 rounded-[24px] hover:border-emerald-500/30 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{c.title}</span>
                <div className="icon-badge-green shrink-0 !w-10 !h-10">
                  <IconComp size={18} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-slate-900">{c.value}</p>
                <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight size={12} /> {c.change}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Onboarding Pipeline Tracker */}
      <div className="glass-garden-card p-6 rounded-[28px]">
        <h3 className="text-base font-bold text-slate-900 mb-4">Client Onboarding & Conversion Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-4 bg-white/80 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black mx-auto mb-2 text-xs">1</div>
            <p className="text-xs font-bold text-slate-700">Registration</p>
            <p className="text-lg font-black text-slate-900 mt-1">{metrics?.totalClients || 0}</p>
          </div>
          <div className="p-4 bg-white/80 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black mx-auto mb-2 text-xs">2</div>
            <p className="text-xs font-bold text-slate-700">Authenticated</p>
            <p className="text-lg font-black text-slate-900 mt-1">{metrics?.totalClients || 0}</p>
          </div>
          <div className="p-4 bg-white/80 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-black mx-auto mb-2 text-xs">3</div>
            <p className="text-xs font-bold text-slate-700">YouTube Linked</p>
            <p className="text-lg font-black text-slate-900 mt-1">{metrics?.connectedChannels || 0}</p>
          </div>
          <div className="p-4 bg-white/80 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-black mx-auto mb-2 text-xs">4</div>
            <p className="text-xs font-bold text-slate-700">Automation Active</p>
            <p className="text-lg font-black text-slate-900 mt-1">{metrics?.totalAiReplies || 0}</p>
          </div>
          <div className="p-4 bg-white/80 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-black mx-auto mb-2 text-xs">5</div>
            <p className="text-xs font-bold text-slate-700">Active Subscriber</p>
            <p className="text-lg font-black text-slate-900 mt-1">{metrics?.activeSubscribers || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
