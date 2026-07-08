import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CreditCard, 
  Check, 
  AlertTriangle, 
  Loader2, 
  Sparkles, 
  Star, 
  LogOut, 
  ArrowRight, 
  UserCheck, 
  Zap, 
  History, 
  Download, 
  ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const SubscriptionPage = ({ isGate = false, onSelectPlan }) => {
  const { logout } = useAuth();
  const [subData, setSubData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('plans'); // 'plans' or 'billing'

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscription/status');
      setSubData(res.data.subscription);
    } catch (err) {
      console.error('Failed to load subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const res = await api.get('/subscription/invoices');
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'billing') {
      fetchInvoices();
    }
  }, [activeSubTab]);

  const handleSubscribe = async (planType) => {
    try {
      setPurchasing(true);
      setMessage('');
      const res = await api.post('/subscription/create', { planType });
      if (res.data.shortUrl) {
        window.location.href = res.data.shortUrl; // Redirect to Razorpay hosted checkout
      } else {
        setMessage('Checkout URL missing. Running in developer sandbox mode.');
        // Verify mock subscription locally
        if (res.data.subscriptionId) {
          await api.post('/subscription/verify', { razorpay_subscription_id: res.data.subscriptionId });
          await fetchStatus();
        }
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Subscription initiation failed.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will return to the Free Plan at the end of the billing period.')) return;
    try {
      setCancelling(true);
      setMessage('');
      const res = await api.post('/subscription/cancel');
      if (res.data.success) {
        await fetchStatus();
        alert('Subscription cancelled successfully.');
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#ff0000]" size={40} />
      </div>
    );
  }

  const isPlanActive = (planType) => {
    return subData && subData.planType === planType && subData.status === 'active';
  };

  const hasAnyActiveSub = subData && subData.status === 'active';

  const plans = [
    {
      type: "starter",
      name: "Starter Plan",
      price: "₹299",
      period: "/ month",
      desc: "Perfect for single creators starting out.",
      features: [
        "Connect 1 YouTube Channel",
        "AI Autopilot Moderation",
        "DeepSeek Lite Response Engine",
        "Real-Time Activity Dashboard"
      ],
      color: "text-blue-600",
      bgClass: "border-blue-200"
    },
    {
      type: "professional",
      name: "Professional",
      price: "₹999",
      period: "/ month",
      desc: "Great for growing YouTube channels.",
      features: [
        "Connect 3 YouTube Channels",
        "Priority AI Response Generation",
        "WhatsApp Auto DM Integrations",
        "Exportable Lead Databases"
      ],
      color: "text-red-500",
      bgClass: "border-red-200",
      recommended: true
    },
    {
      type: "business",
      name: "Business Plan",
      price: "₹2,999",
      period: "/ month",
      desc: "Designed for multi-channel creators & agencies.",
      features: [
        "Connect 10 YouTube Channels",
        "Full DeepSeek Pro API access",
        "Advanced Team Roles & Access",
        "Direct Live WhatsApp Broadcasts"
      ],
      color: "text-amber-500",
      bgClass: "border-amber-200"
    },
    {
      type: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "Custom solutions for large networks.",
      features: [
        "Connect Unlimited Channels",
        "Dedicated Sentiment Models",
        "Custom Integration Support",
        "Dedicated Account Manager"
      ],
      color: "text-emerald-500",
      bgClass: "border-emerald-200"
    }
  ];

  return (
    <div className={`max-w-5xl mx-auto w-full transition-all duration-500 ${isGate ? 'max-w-4xl py-6' : 'py-2'}`}>
      
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-red-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Header Panel */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-zinc-200/50 mb-8">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-650 rounded-full border border-red-100 mb-2">
            <Zap size={14} className="fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">SaaS Plans & Billing</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight leading-none">
            Choose Your AI Engine
          </h1>
          <p className="text-[14px] text-zinc-500 font-medium max-w-xl">
            Upgrade your organization's subscription to link multiple channels, scale AI operations, and download invoices.
          </p>
        </div>
        
        {isGate ? (
          <button
            onClick={logout}
            className="self-start md:self-center flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-50 text-zinc-900 font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-zinc-200 shadow-sm hover:shadow active:scale-95"
          >
            <LogOut size={16} /> Logout
          </button>
        ) : (
          <div className="flex bg-zinc-200/50 p-1 rounded-2xl border border-zinc-200">
            <button
              onClick={() => setActiveSubTab('plans')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                activeSubTab === 'plans' 
                  ? 'bg-zinc-950 text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveSubTab('billing')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                activeSubTab === 'billing' 
                  ? 'bg-zinc-950 text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Billing History
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="relative z-10 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold rounded-2xl flex items-center gap-2 mb-6 shadow-sm">
          <AlertTriangle size={18} /> {message}
        </div>
      )}

      {activeSubTab === 'plans' ? (
        <div className="space-y-8 relative z-10">
          
          {/* Active Subscription Banner */}
          {!isGate && (
            <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/50 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-widest border ${
                    hasAnyActiveSub 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-zinc-100 text-zinc-650 border-zinc-200'
                  }`}>
                    {hasAnyActiveSub ? `Active: ${subData.planType}` : 'Free Tier Active'}
                  </span>
                  {hasAnyActiveSub && <span className="text-xs text-zinc-400 font-semibold">Subscription ID: {subData.id}</span>}
                </div>
                
                <p className="text-sm text-zinc-800 font-black">
                  {hasAnyActiveSub ? (
                    `Premium Active — Connected channels share organization limits under the ${subData.planType} tier.`
                  ) : (
                    'Free Plan Active — Enforcing a 1-channel connection limit.'
                  )}
                </p>
                {hasAnyActiveSub && subData.currentEnd && (
                  <p className="text-xs text-zinc-400 font-bold">
                    {subData.status === 'cancelled' ? 'Access ends on: ' : 'Next renewal date: '} {new Date(subData.currentEnd).toLocaleDateString()}
                  </p>
                )}
              </div>

              {hasAnyActiveSub && subData.status !== 'cancelled' && (
                <button
                  disabled={cancelling}
                  onClick={handleCancel}
                  className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-red-200 disabled:opacity-50 active:scale-95 shrink-0"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const isActive = isPlanActive(plan.type);
              
              return (
                <div 
                  key={plan.type}
                  className={`bg-white/60 backdrop-blur-xl rounded-[28px] border border-white/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-zinc-300 relative overflow-hidden ${
                    plan.recommended && !hasAnyActiveSub ? 'ring-2 ring-red-500 ring-offset-2' : ''
                  }`}
                >
                  {plan.recommended && !hasAnyActiveSub && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest py-1 px-4 rounded-bl-2xl">
                      Popular
                    </div>
                  )}
                  
                  <div>
                    <div className="mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${plan.color}`}>
                        {plan.name}
                      </span>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-black text-zinc-950 tracking-tight">{plan.price}</span>
                        <span className="text-[11px] font-semibold text-zinc-400 ml-1">{plan.period}</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-semibold mt-2 min-h-[32px]">{plan.desc}</p>
                    </div>

                    <div className="w-full h-[1px] bg-zinc-200/50 my-4" />

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-bold text-zinc-600">
                          <Check size={14} className="text-green-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={purchasing || isActive || plan.type === 'enterprise'}
                    onClick={() => handleSubscribe(plan.type)}
                    className={`w-full py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      isActive 
                        ? 'bg-green-500 text-white cursor-default'
                        : plan.type === 'enterprise'
                        ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white active:scale-98'
                    }`}
                  >
                    {purchasing ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : isActive ? (
                      <>
                        <UserCheck size={14} /> Active
                      </>
                    ) : plan.type === 'enterprise' ? (
                      'Contact Us'
                    ) : (
                      <>
                        Subscribe <ArrowRight size={12} />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Billing History Table */
        <div className="relative z-10 bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/50 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.02)] text-zinc-800">
          <div className="flex items-center gap-2 mb-6">
            <History size={18} className="text-zinc-650" />
            <h2 className="text-lg font-black text-zinc-900">Payment Invoice Logs</h2>
          </div>

          {loadingInvoices ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-zinc-600" size={32} />
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-bold text-xs uppercase tracking-widest">
              No subscription payment invoices found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 uppercase tracking-widest text-[9px] font-black">
                    <th className="pb-3">Invoice ID</th>
                    <th className="pb-3">Invoice Number</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="text-zinc-700">
                      <td className="py-4 font-mono font-bold text-zinc-400">{inv.id}</td>
                      <td className="py-4">{inv.invoice_number || 'N/A'}</td>
                      <td className="py-4">
                        {inv.issued_at ? new Date(inv.issued_at * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 font-black">
                        {(inv.amount / 100).toLocaleString('en-IN', { style: 'currency', currency: inv.currency || 'INR' })}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          inv.status === 'paid' || inv.status === 'issued'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => alert(`Invoice details: ${inv.id}`)}
                          className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-500 hover:text-zinc-900 transition-colors inline-flex items-center gap-1"
                        >
                          <Download size={14} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
