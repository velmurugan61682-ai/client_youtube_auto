import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CreditCard, 
  Check, 
  AlertTriangle, 
  Loader2, 
  Star, 
  LogOut, 
  ArrowRight, 
  UserCheck, 
  History, 
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SubscriptionPage = ({ isGate = false, onSelectPlan }) => {
  const { logout } = useAuth();
  const [subData, setSubData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('plans'); // 'plans' or 'billing'
  const [, setTrialExpired] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscription/status');
      setSubData(res.data.subscription);
      setTrialExpired(res.data.trialExpired || false);
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
    Promise.resolve().then(() => {
      fetchStatus();
    });
  }, []);

  useEffect(() => {
    if (activeSubTab === 'billing') {
      Promise.resolve().then(() => {
        fetchInvoices();
      });
    }
  }, [activeSubTab]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planType) => {
    if (purchasingPlan) return;
    try {
      setPurchasingPlan(planType);
      setMessage('');

      // If it is the Free Plan, downgrade directly
      if (planType === 'free') {
        const res = await api.post('/subscription/create', { planType });
        if (res.data.success) {
          await fetchStatus();
          alert('Downgraded to Free Plan successfully.');
          if (onSelectPlan) onSelectPlan();
        }
        return;
      }

      // Otherwise, handle paid subscription
      const res = await api.post('/subscription/create', { planType });
      const { orderId, subscriptionId, razorpayKeyId, amount, currency } = res.data;

      const activeKey = razorpayKeyId || 'rzp_test_SnyBwTTmMiaZjY';
      const activeOrderId = orderId || subscriptionId;

      // Load Razorpay script for standard checkout
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setMessage('Failed to load Razorpay SDK. Please check your internet connection.');
        return;
      }

      // Open Razorpay Standard Checkout Modal
      const options = {
        key: activeKey,
        amount: amount || 99900,
        currency: currency || "INR",
        name: "Channelmate",
        description: "Quarterly Pro Subscription (₹999)",
        order_id: activeOrderId,
        handler: async function (response) {
          try {
            setPurchasingPlan(planType);
            const verifyRes = await api.post('/subscription/verify', {
              razorpay_order_id: response.razorpay_order_id || activeOrderId,
              razorpay_subscription_id: response.razorpay_subscription_id || activeOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType
            });
            if (verifyRes.data.success) {
              await fetchStatus();
              alert('Subscription activated successfully!');
              if (onSelectPlan) onSelectPlan();
            }
          } catch (err) {
            console.error(err);
            setMessage('Payment verification failed. Please contact support.');
          } finally {
            setPurchasingPlan(null);
          }
        },
        prefill: {
          email: subData?.email || '',
        },
        theme: {
          color: "#ff0000"
        },
        modal: {
          ondismiss: function() {
            setPurchasingPlan(null);
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Subscription initiation failed.');
    } finally {
      setPurchasingPlan(null);
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
    if (!subData) return planType === 'free';
    const currentPlan = (subData.planType || subData.planId || 'free').toLowerCase();
    const isPaidActive = subData.status === 'active' || (subData.status === 'cancelled' && subData.currentEnd && new Date(subData.currentEnd) > new Date());

    if (planType === 'free') {
      return !isPaidActive || currentPlan === 'free' || currentPlan === 'none' || currentPlan.includes('free');
    }

    if (planType === 'quarterly') {
      return isPaidActive && (currentPlan === 'quarterly' || currentPlan.includes('pro') || currentPlan.includes('999') || currentPlan.includes('quarterly'));
    }

    return isPaidActive && currentPlan === planType;
  };

  const planDisplayNames = {
    free: 'Free Plan',
    quarterly: 'Pro Plan (₹999)',
    quarterly_pro: 'Pro Plan (₹999)',
    three_months_999: 'Pro Plan (₹999)'
  };

  const hasAnyActiveSub = subData && (subData.status === 'active' || 
    (subData.status === 'cancelled' && subData.currentEnd && new Date(subData.currentEnd) > new Date()));

  const plans = [
    {
      type: "free",
      name: "STARTER PACK",
      displayName: "Free Plan",
      price: "₹0",
      period: "/ forever",
      desc: "Perfect for single creators starting out.",
      features: [
        "Connect 1 YouTube Channel",
        "AI Autopilot Comment Moderation",
        "Comment Automation Engine",
        "Basic Analytics Dashboard"
      ],
      color: "text-zinc-500",
      bgClass: "border-zinc-200"
    },
    {
      type: "quarterly",
      name: "BEST VALUE",
      displayName: "Quarterly Pro",
      price: "₹999",
      period: "/ 3 months",
      desc: "Quarterly saver for professional creators.",
      features: [
        "Connect Unlimited Channels",
        "AI Autopilot Comment Moderation",
        "Auto Reply & Smart Auto-Like",
        "Advanced Audience Analytics",
        "24/7 Priority Support"
      ],
      color: "text-orange-600",
      bgClass: "border-orange-300 ring-2 ring-orange-400/10",
      recommended: true
    }
  ];


  return (
    <div className={`w-full transition-all duration-500 ${isGate ? 'max-w-4xl mx-auto py-6' : 'min-h-[calc(100svh-5.5rem)] min-[1025px]:h-[calc(100vh-2.5rem)] min-[1025px]:min-h-[760px] overflow-visible min-[1025px]:overflow-hidden rounded-[28px] bg-[#eef3f5] p-4 sm:p-5 text-[#0f0f0f]'}`}>
      
      {/* Header Panel */}
      <div className="relative z-10 rounded-[22px] bg-white border border-[#e5e5e5] shadow-sm px-5 sm:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Subscription
          </h1>
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
        <div className="custom-scroll h-[calc(100%-112px)] overflow-y-auto pr-1 space-y-8 relative z-10">
          
          {/* Active Subscription Banner */}
          {!isGate && (
            <div className="bg-white rounded-[22px] border border-[#e5e5e5] p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-widest border ${
                    hasAnyActiveSub 
                      ? 'bg-[#fff1f1] text-[#ff0000] border-red-100' 
                      : 'bg-zinc-100 text-zinc-650 border-zinc-200'
                  }`}>
                    {hasAnyActiveSub ? `Active: ${planDisplayNames[subData.planType] || subData.planType}` : 'Free Tier Active'}
                  </span>
                  {hasAnyActiveSub && <span className="text-xs text-zinc-400 font-semibold">Subscription ID: {subData.id}</span>}
                </div>
                
                <p className="text-sm text-zinc-800 font-black">
                  {hasAnyActiveSub ? (
                    `Premium Active - Connected channels share organization limits under the ${planDisplayNames[subData.planType] || subData.planType} tier.`
                  ) : (
                    'Free Plan Active - Enforcing a 1-channel connection limit.'
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
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8">
            {plans.map((plan) => {
              const isActive = isPlanActive(plan.type);
              
              return (
                <div 
                  key={plan.type}
                  className={`bg-white rounded-[22px] border p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl relative overflow-hidden ${
                    isActive 
                      ? 'border-[#ff0000] ring-2 ring-[#ff0000]/10' 
                      : plan.recommended 
                      ? 'border-orange-300 ring-2 ring-orange-400/10' 
                      : 'border-white/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 right-0 bg-[#ff0000] text-white text-[8px] font-black uppercase tracking-widest py-1.5 px-4 rounded-bl-2xl flex items-center gap-1">
                      <Star size={8} fill="white" /> Active Plan
                    </div>
                  )}
                  
                  <div>
                    <div className="mb-4 flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${plan.color}`}>
                          {plan.name}
                        </span>
                        <h2 className="text-xl font-black text-zinc-950 mt-1">{plan.displayName}</h2>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${plan.type === 'professional' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                        {plan.type === 'professional' ? <CreditCard size={14} /> : <Star size={14} />}
                      </div>
                    </div>

                    <div className="flex items-baseline mt-4">
                      <span className="text-4xl font-black text-zinc-950 tracking-tight">{plan.price}</span>
                      <span className="text-[11px] font-semibold text-zinc-400 ml-1">{plan.period}</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-semibold mt-2 min-h-[32px]">{plan.desc}</p>

                    <div className="w-full h-[1px] bg-zinc-200/50 my-4" />

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-bold text-zinc-600">
                          <Check size={14} className="text-[#ff0000] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={purchasingPlan === plan.type || isActive}
                    onClick={() => handleSubscribe(plan.type)}
                    className={`w-full py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-[#ff0000] text-white cursor-default shadow-[0_4px_12px_rgba(255,0,0,0.18)]'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white active:scale-98'
                    }`}
                  >
                    {purchasingPlan === plan.type ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : isActive ? (
                      <>
                        <UserCheck size={14} /> ACTIVE PLAN
                      </>
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
        <div className="relative z-10 bg-white rounded-[22px] border border-[#e5e5e5] p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.02)] text-zinc-800">
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
                            ? 'bg-[#fff1f1] text-[#ff0000] border border-red-100'
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



