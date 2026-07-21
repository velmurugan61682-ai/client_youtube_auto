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
  X,
  Edit3,
  PlusCircle,
  Filter,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [editModalSub, setEditModalSub] = useState(null);
  const [editForm, setEditForm] = useState({ plan: 'quarterly_pro', status: 'active', renewalDate: '' });
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [clientsList, setClientsList] = useState([]);
  const [assignData, setAssignData] = useState({ userId: '', plan: 'quarterly_pro', durationDays: 90 });
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/subscriptions', {
        params: { status: statusFilter, plan: planFilter }
      });
      if (res.data.success) {
        setSubscriptions(res.data.subscriptions || []);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsForAssign = async () => {
    try {
      const res = await api.get('/admin/clients');
      if (res.data.success) {
        setClientsList(res.data.clients || []);
        if (res.data.clients?.length > 0) {
          setAssignData(prev => ({ ...prev, userId: res.data.clients[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter, planFilter]);

  const handleEditOpen = (sub) => {
    setModalError('');
    setEditModalSub(sub);
    const initialRenewal = sub.renewalDate ? new Date(sub.renewalDate).toISOString().split('T')[0] : '';
    setEditForm({
      plan: sub.plan || 'free',
      status: sub.status || 'active',
      renewalDate: initialRenewal
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editModalSub) return;
    setModalError('');
    try {
      setActionLoading(true);
      await api.patch(`/admin/subscriptions/${editModalSub._id}`, editForm);
      setEditModalSub(null);
      await fetchSubscriptions();
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to update subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!assignData.userId) {
      setModalError('Please select a client');
      return;
    }
    try {
      setActionLoading(true);
      await api.post('/admin/subscriptions', assignData);
      setAssignModalOpen(false);
      await fetchSubscriptions();
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to assign subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async (sub) => {
    if (!window.confirm(`Cancel active subscription for ${sub.email}?`)) return;
    try {
      await api.delete(`/admin/subscriptions/${sub._id}`);
      await fetchSubscriptions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel subscription');
    }
  };

  const filtered = subscriptions.filter(s => {
    const query = search.toLowerCase();
    const matchesSearch = !search || 
                          s.clientName?.toLowerCase().includes(query) || 
                          s.email?.toLowerCase().includes(query) ||
                          s.subscriptionId?.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesPlan = planFilter === 'all' || s.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subscription Engine & Tier Management</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Assign, edit plan terms, update renewal dates, or cancel client subscriptions</p>
        </div>
        <button
          onClick={() => { setModalError(''); fetchClientsForAssign(); setAssignModalOpen(true); }}
          className="btn-glass-primary text-xs px-5 py-2.5 shadow-md flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          Assign New Subscription
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-garden-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscriptions by client, email, sub ID..."
            className="w-full glass-input py-2 pl-10 pr-4 text-xs font-bold outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/80 border border-emerald-500/20 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
              <option value="trial">Trial</option>
            </select>
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-white/80 border border-emerald-500/20 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Plans</option>
            <option value="free">Free Plan (₹0)</option>
            <option value="quarterly_pro">Pro Plan (₹999)</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-garden-card rounded-[28px] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm font-bold text-slate-600">No subscriptions match your query.</p>
            <p className="text-xs text-slate-400 mt-1">Assign a subscription to a client to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  <th className="py-3.5 px-6">Client Email</th>
                  <th className="py-3.5 px-4">Subscription ID</th>
                  <th className="py-3.5 px-4">Plan Tier</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Renewal Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {filtered.map((sub) => (
                  <tr key={sub._id} className="hover:bg-emerald-500/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-black text-slate-900">{sub.clientName}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">{sub.email}</p>
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] text-slate-600">
                      {sub.subscriptionId}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        sub.plan === 'annual_pro' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        sub.plan === 'quarterly_pro' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {sub.plan?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-black text-emerald-700">
                      ₹{sub.amount || 0}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        sub.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        sub.status === 'cancelled' || sub.status === 'expired' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {sub.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-500 font-semibold">
                      {sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditOpen(sub)}
                          title="Edit Subscription Plan & Status"
                          className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                        >
                          <Edit3 size={15} /> Edit
                        </button>
                        {sub.status === 'active' && (
                          <button
                            onClick={() => handleCancelSubscription(sub)}
                            title="Cancel Subscription"
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                          >
                            <XCircle size={15} /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Subscription Modal */}
      <AnimatePresence>
        {editModalSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-900 text-base">Edit Client Subscription</h3>
                <button onClick={() => setEditModalSub(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              {modalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleEditSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Client</label>
                  <input
                    type="text"
                    disabled
                    value={`${editModalSub.clientName} (${editModalSub.email})`}
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none bg-slate-50 text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Subscription Plan</label>
                  <select
                    value={editForm.plan}
                    onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none bg-white cursor-pointer"
                  >
                    <option value="free">Free Plan (₹0)</option>
                    <option value="quarterly_pro">Pro Plan (₹999)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Subscription Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none bg-white cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                    <option value="trial">Trial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Renewal Date</label>
                  <input
                    type="date"
                    value={editForm.renewalDate}
                    onChange={(e) => setEditForm({ ...editForm, renewalDate: e.target.value })}
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditModalSub(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-glass-primary text-xs px-5 py-2.5 shadow-md flex items-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Save Subscription Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Subscription Modal */}
      <AnimatePresence>
        {assignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-900 text-base">Assign Subscription to Client</h3>
                <button onClick={() => setAssignModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              {modalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Select Client</label>
                  <select
                    value={assignData.userId}
                    onChange={(e) => setAssignData({ ...assignData, userId: e.target.value })}
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none bg-white cursor-pointer"
                  >
                    {clientsList.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Plan Tier</label>
                  <select
                    value={assignData.plan}
                    onChange={(e) => setAssignData({ ...assignData, plan: e.target.value })}
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none bg-white cursor-pointer"
                  >
                    <option value="free">Free Plan (₹0 / 30 Days)</option>
                    <option value="quarterly_pro">Pro Plan (₹999 / 90 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={assignData.durationDays}
                    onChange={(e) => setAssignData({ ...assignData, durationDays: e.target.value })}
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-glass-primary text-xs px-5 py-2.5 shadow-md flex items-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Assign Subscription'}
                  </button>
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
