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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Client Directory & Onboarding</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Manage creator accounts, onboarding pipeline, and channel permissions</p>
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
      <div className="glass-garden-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, email, org..."
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
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
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
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-sm font-bold text-slate-600">No clients match your filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the search bar or onboarding a new client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  <th className="py-3.5 px-6">Client / Organization</th>
                  <th className="py-3.5 px-4">Current Plan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Connected Channel</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-emerald-500/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-700 font-black flex items-center justify-center text-xs border border-emerald-500/30">
                          {client.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{client.name}</p>
                          <p className="text-[11px] text-slate-500 font-semibold">{client.email}</p>
                          {client.organization && (
                            <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                              <Building size={10} /> {client.organization}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        client.plan === 'annual_pro' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        client.plan === 'quarterly_pro' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {client.plan?.replace('_', ' ') || 'Free'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        client.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        client.status === 'suspended' || client.status === 'blocked' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {client.status}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {client.connectedChannel ? (
                        <div className="flex items-center gap-2">
                          <img src={client.connectedChannel.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=60'} className="w-6 h-6 rounded-full object-cover" alt="" />
                          <span className="text-slate-900 font-bold text-xs truncate max-w-[140px]">
                            {client.connectedChannel.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Not connected</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-slate-500 font-semibold">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/clients/${client._id}`)}
                          title="View Client Details"
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setEditModalClient({ ...client })}
                          title="Edit Client Profile"
                          className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(client)}
                          title={client.status === 'suspended' ? 'Activate Client' : 'Suspend Client'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            client.status === 'suspended' 
                              ? 'hover:bg-emerald-50 text-emerald-600' 
                              : 'hover:bg-amber-50 text-amber-600'
                          }`}
                        >
                          <Ban size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteModalClient(client)}
                          title="Delete Client"
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Onboard New Client</h3>
                    <p className="text-xs text-slate-400 font-semibold">Create account & assign subscription tier</p>
                  </div>
                </div>
                <button onClick={() => setOnboardModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl">
                  <X size={18} />
                </button>
              </div>

              {modalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleOnboardSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 ml-1">Client Full Name</label>
                  <input
                    type="text"
                    required
                    value={onboardData.name}
                    onChange={(e) => setOnboardData({ ...onboardData, name: e.target.value })}
                    placeholder="e.g. Alex Rivera"
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={onboardData.email}
                    onChange={(e) => setOnboardData({ ...onboardData, email: e.target.value })}
                    placeholder="alex@creatorstudio.com"
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 ml-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={onboardData.password}
                    onChange={(e) => setOnboardData({ ...onboardData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 ml-1">Organization / Agency</label>
                  <input
                    type="text"
                    value={onboardData.organization}
                    onChange={(e) => setOnboardData({ ...onboardData, organization: e.target.value })}
                    placeholder="Apex Media Network"
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 ml-1">Initial Subscription Tier</label>
                  <select
                    value={onboardData.plan}
                    onChange={(e) => setOnboardData({ ...onboardData, plan: e.target.value })}
                    className="w-full glass-input py-2.5 px-3.5 text-xs font-bold outline-none bg-white cursor-pointer"
                  >
                    <option value="free">Free Plan (₹0 / 30 Days)</option>
                    <option value="quarterly_pro">Pro Plan (₹999 / 90 Days)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setOnboardModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-glass-primary text-xs px-5 py-2.5 shadow-md flex items-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Create & Onboard Client'}
                  </button>
                </div>
              </form>
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
                <h3 className="font-black text-slate-900 text-base">Edit Client Profile</h3>
                <button onClick={() => setEditModalClient(null)} className="p-1 text-slate-400 hover:text-slate-700">
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
              <h3 className="text-base font-black text-slate-900 mb-2">Delete Client Account?</h3>
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
