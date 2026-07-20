import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Calendar,
  Zap,
  X
} from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [activateModal, setActivateModal] = useState(null);
  const [extendModal, setExtendModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [extendDays, setExtendDays] = useState(30);
  const [selectedPlan, setSelectedPlan] = useState('professional');

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/subscriptions');
      if (res.data.success) {
        setSubscriptions(res.data.subscriptions || []);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleActivateSubmit = async (e) => {
    e.preventDefault();
    if (!activateModal) return;
    try {
      setActionLoading(true);
      await api.post(`/admin/subscriptions/${activateModal.userId}/activate`, {
        planType: selectedPlan,
        durationDays: 30
      });
      setActivateModal(null);
      await fetchSubscriptions();
    } catch (err) {
      alert('Failed to activate subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!extendModal) return;
    try {
      setActionLoading(true);
      await api.post(`/admin/subscriptions/${extendModal.userId}/extend`, {
        days: extendDays
      });
      setExtendModal(null);
      await fetchSubscriptions();
    } catch (err) {
      alert('Failed to extend subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async (sub) => {
    if (!window.confirm(`Cancel subscription for ${sub.email}?`)) return;
    try {
      await api.post(`/admin/subscriptions/${sub.userId}/cancel`);
      await fetchSubscriptions();
    } catch (err) {
      alert('Failed to cancel subscription');
    }
  };

  const filtered = subscriptions.filter(s => {
    const matchesSearch = s.clientName.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'active') matchesFilter = s.status === 'active';
    else if (filter === 'expired') matchesFilter = s.status === 'expired' || s.status === 'cancelled';
    else if (filter === 'trial') matchesFilter = s.plan.toLowerCase().includes('trial') || s.plan.toLowerCase().includes('free');
    else if (filter === 'paid') matchesFilter = s.paymentStatus === 'captured' || s.status === 'active';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Subscription Management</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Manage active plans, trials, manual extensions, and cancellations</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscriber..."
              className="glass-input py-2 pl-9 pr-4 text-xs font-bold w-56 outline-none"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="glass-input py-2 px-3 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">All Plans</option>
            <option value="active">Active Only</option>
            <option value="trial">Trial Users</option>
            <option value="expired">Expired Users</option>
            <option value="paid">Paid Subscribers</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table Card */}
      <div className="glass-garden-card p-0 rounded-[28px] overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">
            No subscription records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-4">Current Plan</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Razorpay Sub ID</th>
                  <th className="py-4 px-4">Expiry Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filtered.map(sub => (
                  <tr key={sub.userId} className="hover:bg-white/60 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-black text-slate-900">{sub.clientName}</p>
                      <p className="text-[10px] text-slate-400">{sub.email}</p>
                    </td>
                    <td className="py-4 px-4 font-bold uppercase text-emerald-700">
                      {sub.plan}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`yt-badge ${sub.status === 'active' ? 'yt-badge-success' : 'yt-badge-danger'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[11px] font-mono text-slate-500">
                      {sub.razorpaySubscriptionId}
                    </td>
                    <td className="py-4 px-4 text-slate-700">
                      {new Date(sub.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActivateModal(sub)}
                          className="btn-glass-primary !py-1.5 !px-3 !text-[11px]"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => setExtendModal(sub)}
                          className="btn-glass-secondary !py-1.5 !px-3 !text-[11px]"
                        >
                          Extend
                        </button>
                        <button
                          onClick={() => handleCancelSubscription(sub)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Cancel Subscription"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Activate Modal */}
      <AnimatePresence>
        {activateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-garden-card p-6 rounded-[28px] max-w-sm w-full text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">Activate Plan: {activateModal.clientName}</h3>
                <button onClick={() => setActivateModal(null)}><X size={18} /></button>
              </div>
              <form onSubmit={handleActivateSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Select Tier</label>
                  <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="w-full glass-input py-2 px-3 text-xs font-bold">
                    <option value="monthly">Monthly (₹345 / mo)</option>
                    <option value="quarterly">Quarterly (₹999 / 3 mos)</option>
                    <option value="yearly">Yearly (₹2,999 / yr)</option>
                    <option value="professional">Professional Pro</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActivateModal(null)} className="btn-glass-secondary text-xs py-1.5 px-3">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="btn-glass-primary text-xs py-1.5 px-4">{actionLoading ? <Loader2 className="animate-spin" size={14} /> : 'Confirm Activation'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Extend Modal */}
      <AnimatePresence>
        {extendModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-garden-card p-6 rounded-[28px] max-w-sm w-full text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">Extend Expiry: {extendModal.clientName}</h3>
                <button onClick={() => setExtendModal(null)}><X size={18} /></button>
              </div>
              <form onSubmit={handleExtendSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Days to Add</label>
                  <input type="number" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} className="w-full glass-input py-2 px-3 text-xs font-bold" min="1" max="365" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setExtendModal(null)} className="btn-glass-secondary text-xs py-1.5 px-3">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="btn-glass-primary text-xs py-1.5 px-4">{actionLoading ? <Loader2 className="animate-spin" size={14} /> : 'Extend Expiry'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSubscriptionsPage;
