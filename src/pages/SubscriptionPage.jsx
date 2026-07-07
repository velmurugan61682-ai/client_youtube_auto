import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, Check, AlertTriangle, ShieldAlert, Loader2, Sparkles, Star, LogOut, ArrowRight, UserCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SubscriptionPage = ({ isGate = false, onSelectPlan }) => {
  const { logout } = useAuth();
  const [subData, setSubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubscribe = async (planType) => {
    try {
      setPurchasing(true);
      setMessage('');
      const res = await api.post('/subscription/create', { planType });
      if (res.data.shortUrl) {
        window.location.href = res.data.shortUrl; // Redirect to Razorpay hosted checkout
      } else {
        setMessage('Checkout URL missing. Please configure Razorpay keys.');
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Subscription initiation failed.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your Premium Pro subscription? You will return to the Free Plan at the end of the billing period.')) return;
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

  const isPremiumActive = subData && (subData.status === 'active' || subData.id === 'trial_promo_active');
  const isTrial = subData && subData.id === 'trial_promo_active';
  const isCancelled = subData && subData.status === 'cancelled';

  return (
    <div className={`max-w-5xl mx-auto w-full transition-all duration-500 ${isGate ? 'max-w-4xl py-6' : 'py-2'}`}>
      
      {/* Background Decorative Blobs for premium aesthetic */}
      {isGate && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-red-500/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-orange-500/5 blur-[120px]" />
        </div>
      )}

      {/* Header Panel */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-[#f0f0f0]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 mb-2">
            <Zap size={14} className="fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">SaaS Plans & Gate</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0f0f0f] tracking-tight leading-none">
            Choose Your AI Engine
          </h1>
          <p className="text-[14px] text-[#606060] font-medium max-w-xl">
            {isGate 
              ? 'Connect your channel and automate your YouTube comment responses with DeepSeek AI.' 
              : 'Upgrade to Premium Pro to connect multiple channels or manage your active plan settings.'
            }
          </p>
        </div>
        
        {isGate && (
          <button
            onClick={logout}
            className="self-start md:self-center flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#fafafa] text-[#0f0f0f] font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-[#e0e0e0] shadow-sm hover:shadow active:scale-95"
          >
            <LogOut size={16} /> Logout
          </button>
        )}
      </div>

      {message && (
        <div className="relative z-10 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl flex items-center gap-2">
          <AlertTriangle size={18} /> {message}
        </div>
      )}

      {/* Active Subscription Banner (Visible in dashboard tab) */}
      {!isGate && (
        <div className="relative z-10 bg-white rounded-[32px] border border-[#f0f0f0] p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-widest border ${
                isPremiumActive 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {isPremiumActive ? (isTrial ? 'Premium Pro (Trial)' : 'Premium Pro Active') : 'Free Tier Active'}
              </span>
              {isPremiumActive && <span className="text-xs text-[#909090] font-semibold">ID: {subData.id}</span>}
            </div>
            
            <p className="text-sm text-[#303030] font-black">
              {isPremiumActive ? (
                'Pro Access Active — Connect unlimited channels and run autopilot moderation.'
              ) : (
                'Free Plan Active — Enforcing a 1-channel connection limit.'
              )}
            </p>
            {isPremiumActive && subData.currentEnd && (
              <p className="text-xs text-[#909090] font-bold">
                {isCancelled ? 'Access ends on: ' : 'Next renewal date: '} {new Date(subData.currentEnd).toLocaleDateString()}
              </p>
            )}
          </div>

          {isPremiumActive && !isTrial && !isCancelled && (
            <button
              disabled={cancelling}
              onClick={handleCancel}
              className="px-6 py-3 bg-[#fce8e6] text-[#d93025] hover:bg-[#fbd3cf] font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-[#d93025]/10 disabled:opacity-50 active:scale-95 shrink-0"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          )}

          {isCancelled && (
            <span className="text-xs text-red-600 font-bold bg-red-50 border border-red-100 rounded-2xl px-5 py-2.5 shrink-0">
              Cancelled (Expires {new Date(subData.currentEnd).toLocaleDateString()})
            </span>
          )}
        </div>
      )}

      {/* Premium Plans Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        
        {/* Free Plan Card */}
        <div className={`bg-white rounded-[32px] border border-[#f0f0f0] p-8 shadow-sm flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:border-gray-300 relative overflow-hidden ${
          !isPremiumActive && !isGate ? 'ring-2 ring-gray-900 ring-offset-2' : ''
        }`}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-black uppercase text-[#909090] tracking-widest">Starter Pack</span>
                <h3 className="text-2xl font-black text-[#0f0f0f] tracking-tight mt-1">Free Plan</h3>
              </div>
              <span className="p-3 bg-gray-50 text-gray-500 rounded-2xl border border-[#f0f0f0]"><Star size={24} /></span>
            </div>
            
            <div className="mb-8">
              <span className="text-5xl font-black text-[#0f0f0f] tracking-tight">₹0</span>
              <span className="text-sm font-semibold text-[#909090]"> / forever</span>
            </div>

            <div className="w-full h-[1px] bg-[#f0f0f0] mb-6" />

            <ul className="space-y-4 mb-8">
              {[
                { label: 'Connect 1 YouTube Channel', active: true },
                { label: 'AI Autopilot Comment Moderation', active: true },
                { label: 'Auto DM WhatsApp Automations', active: true },
                { label: 'Basic Analytics Dashboard', active: true }
              ].map((feat, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-bold text-[#404040]">
                  <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-200 shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {feat.label}
                </li>
              ))}
            </ul>
          </div>

          {isGate ? (
            <button
              onClick={onSelectPlan}
              className="w-full py-4 bg-[#0f0f0f] hover:bg-[#ff0000] text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 group/btn"
            >
              Continue on Free Plan <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
            </button>
          ) : (
            <button
              disabled
              className={`w-full py-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all border ${
                !isPremiumActive 
                  ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-default' 
                  : 'bg-white hover:bg-gray-50 text-[#0f0f0f] border-gray-200 cursor-not-allowed'
              }`}
            >
              {!isPremiumActive ? 'Active Plan' : 'Free Tier'}
            </button>
          )}
        </div>

        {/* Premium Pro Plan Card */}
        <div className={`bg-white rounded-[32px] p-8 shadow-sm flex flex-col justify-between group transition-all duration-500 hover:shadow-2xl relative overflow-hidden border-2 ${
          isPremiumActive 
            ? 'border-green-500 ring-4 ring-green-100' 
            : 'border-red-500 hover:border-red-600 shadow-red-500/[0.02]'
        }`}>
          {/* Badge overlays */}
          {!isPremiumActive && (
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest py-1.5 px-5 rounded-bl-3xl shadow-sm">
              Recommended
            </div>
          )}
          {isPremiumActive && (
            <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest py-1.5 px-5 rounded-bl-3xl shadow-sm flex items-center gap-1">
              <UserCheck size={10} /> Active Pro
            </div>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-black uppercase text-red-500 tracking-widest">SaaS Professional</span>
                <h3 className="text-2xl font-black text-[#0f0f0f] tracking-tight mt-1">Premium Pro</h3>
              </div>
              <span className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100"><CreditCard size={24} /></span>
            </div>
            
            <div className="mb-8">
              <span className="text-5xl font-black text-[#0f0f0f] tracking-tight">₹999</span>
              <span className="text-sm font-semibold text-[#909090]"> / month</span>
            </div>

            <div className="w-full h-[1px] bg-[#f0f0f0] mb-6" />

            <ul className="space-y-4 mb-8">
              {[
                { label: 'Connect Unlimited YouTube Channels', active: true },
                { label: 'Dedicated Channel Sync Workers', active: true },
                { label: 'Advanced Multi-Account Analytics', active: true },
                { label: '24/7 Priority VIP Support', active: true }
              ].map((feat, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-bold text-[#404040]">
                  <span className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {feat.label}
                </li>
              ))}
            </ul>
          </div>

          <button
            disabled={purchasing || isPremiumActive}
            onClick={() => handleSubscribe('monthly')}
            className={`w-full py-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 ${
              isPremiumActive
                ? 'bg-green-500 hover:bg-green-600 text-white cursor-default shadow-green-200'
                : 'bg-red-600 hover:bg-red-700 text-white group-hover:scale-[1.01]'
            }`}
          >
            {purchasing ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Processing...
              </>
            ) : isPremiumActive ? (
              <>
                <UserCheck size={16} /> Active Pro Session
              </>
            ) : isCancelled ? (
              'Renew Pro Subscription'
            ) : (
              <>
                Upgrade / Switch to Pro <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionPage;
