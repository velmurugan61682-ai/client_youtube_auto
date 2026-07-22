import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Ban, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  X,
  PlaySquare,
  AlertTriangle,
  UserPlus,
  Building,
  Mail,
  Lock,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const navigate = useNavigate();

  // Modal states
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [onboardData, setOnboardData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    plan: 'free'
  });
  const [editModalClient, setEditModalClient] = useState(null);
  const [deleteModalClient, setDeleteModalClient] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/clients', {
        params: { search, status: statusFilter, plan: planFilter }
      });
      if (res.data.success) {
        setClients(res.data.clients || res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter, planFilter]);

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      setActionLoading(true);
      const res = await api.post('/admin/clients', onboardData);
      if (res.data.success) {
        setOnboardModalOpen(false);
        setOnboardData({ name: '', email: '', password: '', organization: '', plan: 'free' });
        await fetchClients();
      }
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to onboard client');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editModalClient) return;
    setModalError('');
    try {
      setActionLoading(true);
      await api.patch(`/admin/clients/${editModalClient._id}`, {
        name: editModalClient.name,
        email: editModalClient.email,
        status: editModalClient.status,
        organization: editModalClient.organization
      });
      setEditModalClient(null);
      await fetchClients();
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to update client profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (client) => {
    const newStatus = client.status === 'suspended' || client.status === 'blocked' ? 'active' : 'suspended';
    try {
      await api.patch(`/admin/clients/${client._id}`, { status: newStatus });
      await fetchClients();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalClient) return;
    try {
      setActionLoading(true);
      await api.delete(`/admin/clients/${deleteModalClient._id}?hard=true`);
      setDeleteModalClient(null);
      await fetchClients();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete client account');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredClients = clients.filter(c => {
    const query = search.toLowerCase();
    const matchesSearch = !search || 
                          c.name?.toLowerCase().includes(query) || 
                          c.email?.toLowerCase().includes(query) ||
                          c.organization?.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPlan = planFilter === 'all' || c.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-5 rounded-[28px] bg-[#eef3f5] p-4 sm:p-5 min-h-[calc(100vh-2.5rem)]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0f0f0f] tracking-tight">Client Directory & Onboarding</h1>
          <p className="text-xs font-semibold text-[#606060] mt-1">Manage creator accounts, onboarding pipeline, and channel permissions</p>
        </div>
        <button
          onClick={() => { setModalError(''); setOnboardModalOpen(true); }}
          className="btn-glass-primary text-xs px-5 py-2.5 shadow-md flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <UserPlus size={16} />
          Onboard New Client
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-[22px] border border-white/80 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#909090]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, email, org..."
            className="w-full bg-[#f2f2f2] border border-transparent focus:border-[#0f0f0f] rounded-full py-3 pl-10 pr-4 text-xs font-bold outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#909090]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#f7f7f7] border border-[#ededed] rounded-full px-4 py-2.5 text-xs font-black text-[#0f0f0f] outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-[#f7f7f7] border border-[#ededed] rounded-full px-4 py-2.5 text-xs font-black text-[#0f0f0f] outline-none cursor-pointer"
          >
            <option value="all">All Plans</option>
            <option value="free">Free Plan (₹0)</option>
            <option value="quarterly_pro">Pro Plan (₹999)</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[22px] border border-white/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#ff0000]" size={32} />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm font-bold text-[#606060]">No clients match your filter criteria.</p>
            <p className="text-xs text-[#909090] mt-1">Try resetting the search bar or onboarding a new client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 text-[10px] font-black uppercase text-[#909090] border-b border-slate-100">
                  <th className="py-3.5 px-6">Client / Organization</th>
                  <th className="py-3.5 px-4">Current Plan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Connected Channel</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee] text-xs font-bold text-[#3f3f3f]">
                {filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-[#f7f7f7] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#ff0000] text-white font-black flex items-center justify-center text-xs border border-red-100">
                          {client.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="font-black text-[#0f0f0f]">{client.name}</p>
                          <p className="text-[11px] text-[#606060] font-semibold">{client.email}</p>
                          {client.organization && (
                            <p className="text-[10px] text-[#cc0000] font-bold flex items-center gap-1 mt-0.5">
                              <Building size={10} /> {client.organization}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        client.plan === 'annual_pro' ? 'bg-[#f7f7f7] text-[#0f0f0f] border border-[#e5e5e5]' :
                        client.plan === 'quarterly_pro' ? 'bg-[#fff1f1] text-[#cc0000] border border-red-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {client.plan?.replace('_', ' ') || 'Free'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        client.status === 'active' ? 'bg-[#f2f2f2] text-[#0f0f0f] border border-[#e5e5e5]' :
                        client.status === 'suspended' || client.status === 'blocked' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-[#fff1f1] text-[#ff0000] border border-red-100'
                      }`}>
                        {client.status}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {client.connectedChannel ? (
                        <div className="flex items-center gap-2">
                          <img src={client.connectedChannel.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=60'} className="w-6 h-6 rounded-full object-cover" alt="" />
                          <span className="text-[#0f0f0f] font-bold text-xs truncate max-w-[140px]">
                            {client.connectedChannel.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#909090] text-[11px] italic">Not connected</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-[#606060] font-semibold">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/clients/${client._id}`)}
                          title="View Client Details"
                          className="p-2 hover:bg-[#f2f2f2] text-[#606060] rounded-full transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setEditModalClient({ ...client })}
                          title="Edit Client Profile"
                          className="p-2 hover:bg-[#fff1f1] text-[#ff0000] rounded-full transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(client)}
                          title={client.status === 'suspended' ? 'Activate Client' : 'Suspend Client'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            client.status === 'suspended' 
                              ? 'hover:bg-[#fff1f1] text-[#ff0000]' 
                              : 'hover:bg-[#fff7ed] text-[#d97706]'
                          }`}
                        >
                          <Ban size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteModalClient(client)}
                          title="Delete Client"
                          className="p-2 hover:bg-red-50 text-[#ff0000] rounded-full transition-colors"
                        >
                          <Trash2 size={16} />
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

      {/* Onboard Client Modal */}
      <AnimatePresence>
        {onboardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f0f0f]/55 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className="bg-white rounded-[28px] max-w-4xl w-full shadow-2xl border border-[#e5e5e5] overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="bg-[#0f0f0f] text-white p-6 sm:p-8 flex flex-col justify-between gap-8">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[#ff0000] text-white flex items-center justify-center shadow-lg shadow-red-900/30">
                      <UserPlus size={22} />
                    </div>
                    <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-[#ff0000]">Studio onboarding</p>
                    <h3 className="mt-2 text-3xl font-black leading-tight">Create a new creator account</h3>
                    <p className="mt-3 text-xs font-semibold leading-relaxed text-white/65">
                      Add the client profile, assign the first plan, and prepare their YouTube automation workspace.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs font-bold">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/8 border border-white/10 px-4 py-3">
                      <PlaySquare size={16} className="text-[#ff0000]" />
                      <span>YouTube channel access ready</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white/8 border border-white/10 px-4 py-3">
                      <Sparkles size={16} className="text-[#ff0000]" />
                      <span>AI moderation defaults enabled</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white/8 border border-white/10 px-4 py-3">
                      <CheckCircle size={16} className="text-[#ff0000]" />
                      <span>Subscription tier assigned</span>
                    </div>
                  </div>
                </aside>

                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4 mb-6 border-b border-[#eeeeee] pb-5">
                    <div>
                      <h3 className="font-black text-[#0f0f0f] text-xl">Onboard New Client</h3>
                      <p className="text-xs text-[#606060] font-semibold mt-1">Create account and assign subscription tier</p>
                    </div>
                    <button onClick={() => setOnboardModalOpen(false)} className="p-2 text-[#606060] hover:text-[#0f0f0f] hover:bg-[#f2f2f2] rounded-full transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  {modalError && (
                    <div className="mb-5 p-3 bg-[#fff1f1] border border-red-100 rounded-2xl text-[#cc0000] text-xs font-bold">
                      {modalError}
                    </div>
                  )}

                  <form onSubmit={handleOnboardSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-[#606060] mb-1.5 ml-1">Client Full Name</label>
                        <div className="relative">
                          <UserPlus size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#909090]" />
                          <input
                            type="text"
                            required
                            value={onboardData.name}
                            onChange={(e) => setOnboardData({ ...onboardData, name: e.target.value })}
                            placeholder="e.g. Alex Rivera"
                            className="w-full bg-[#f7f7f7] border border-[#ededed] focus:border-[#0f0f0f] rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-[#606060] mb-1.5 ml-1">Email Address</label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#909090]" />
                          <input
                            type="email"
                            required
                            value={onboardData.email}
                            onChange={(e) => setOnboardData({ ...onboardData, email: e.target.value })}
                            placeholder="alex@creatorstudio.com"
                            className="w-full bg-[#f7f7f7] border border-[#ededed] focus:border-[#0f0f0f] rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-[#606060] mb-1.5 ml-1">Initial Password</label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#909090]" />
                          <input
                            type="password"
                            required
                            value={onboardData.password}
                            onChange={(e) => setOnboardData({ ...onboardData, password: e.target.value })}
                            placeholder="Password"
                            className="w-full bg-[#f7f7f7] border border-[#ededed] focus:border-[#0f0f0f] rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-[#606060] mb-1.5 ml-1">Organization / Agency</label>
                        <div className="relative">
                          <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#909090]" />
                          <input
                            type="text"
                            value={onboardData.organization}
                            onChange={(e) => setOnboardData({ ...onboardData, organization: e.target.value })}
                            placeholder="Apex Media Network"
                            className="w-full bg-[#f7f7f7] border border-[#ededed] focus:border-[#0f0f0f] rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#606060] mb-1.5 ml-1">Initial Subscription Tier</label>
                      <select
                        value={onboardData.plan}
                        onChange={(e) => setOnboardData({ ...onboardData, plan: e.target.value })}
                        className="w-full bg-[#f7f7f7] border border-[#ededed] focus:border-[#0f0f0f] rounded-2xl py-3 px-4 text-xs font-black outline-none cursor-pointer transition-colors"
                      >
                        <option value="free">Free Plan - INR 0 / 30 Days</option>
                        <option value="quarterly_pro">Pro Plan - INR 999 / 90 Days</option>
                      </select>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setOnboardModalOpen(false)}
                        className="px-5 py-3 rounded-full border border-[#d9d9d9] text-[#0f0f0f] text-xs font-black hover:bg-[#f2f2f2] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="bg-[#ff0000] hover:bg-[#cc0000] disabled:opacity-60 text-white text-xs px-6 py-3 rounded-full font-black shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-colors"
                      >
                        {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Create & Onboard Client'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Edit Client Modal */}
      <AnimatePresence>
        {editModalClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-black text-[#0f0f0f] text-base">Edit Client Profile</h3>
                <button onClick={() => setEditModalClient(null)} className="p-1 text-[#909090] hover:text-slate-700">
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
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editModalClient.name || ''}
                    onChange={(e) => setEditModalClient({ ...editModalClient, name: e.target.value })}
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editModalClient.email || ''}
                    onChange={(e) => setEditModalClient({ ...editModalClient, email: e.target.value })}
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Organization</label>
                  <input
                    type="text"
                    value={editModalClient.organization || ''}
                    onChange={(e) => setEditModalClient({ ...editModalClient, organization: e.target.value })}
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Status</label>
                  <select
                    value={editModalClient.status || 'active'}
                    onChange={(e) => setEditModalClient({ ...editModalClient, status: e.target.value })}
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none bg-white cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditModalClient(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-glass-primary text-xs px-5 py-2.5 shadow-md flex items-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-black text-[#0f0f0f] mb-2">Delete Client Account?</h3>
              <p className="text-xs text-slate-500 font-semibold mb-6">
                Are you sure you want to delete <span className="font-bold text-slate-900">{deleteModalClient.name}</span> ({deleteModalClient.email})? This action will perform a cascade removal of all associated data.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalClient(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Permanently Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminClientsPage;
