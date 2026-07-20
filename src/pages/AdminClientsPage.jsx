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
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  // Modal states
  const [editModalClient, setEditModalClient] = useState(null);
  const [deleteModalClient, setDeleteModalClient] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/clients');
      if (res.data.success) {
        setClients(res.data.clients || []);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editModalClient) return;
    try {
      setActionLoading(true);
      await api.put(`/admin/clients/${editModalClient._id}`, {
        name: editModalClient.name,
        email: editModalClient.email,
        status: editModalClient.status
      });
      setEditModalClient(null);
      await fetchClients();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update client profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBlock = async (client) => {
    const newStatus = client.status === 'blocked' ? 'active' : 'blocked';
    try {
      await api.put(`/admin/clients/${client._id}`, { status: newStatus });
      await fetchClients();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalClient) return;
    try {
      setActionLoading(true);
      await api.delete(`/admin/clients/${deleteModalClient._id}`);
      setDeleteModalClient(null);
      await fetchClients();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete client account');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Client Management</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Audit, edit, block, or manage registered SaaS clients</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="glass-input py-2 pl-9 pr-4 text-xs font-bold w-60 outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input py-2 px-3 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Clients Table Card */}
      <div className="glass-garden-card p-0 rounded-[28px] overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">
            No clients match the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Client Name</th>
                  <th className="py-4 px-4">Contact Info</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">YouTube Channel</th>
                  <th className="py-4 px-4">Plan / Expiry</th>
                  <th className="py-4 px-4">Usage (Comments/AI/Leads)</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-white/60 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-black text-slate-900">{client.name}</p>
                      <p className="text-[10px] text-slate-400">Created: {new Date(client.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{client.email}</p>
                      <p className="text-[10px] text-slate-400">{client.phone}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`yt-badge ${
                        client.status === 'active' ? 'yt-badge-success' :
                        client.status === 'blocked' ? 'yt-badge-danger' : 'yt-badge-warning'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {client.connectedChannel ? (
                        <div className="flex items-center gap-2">
                          <img 
                            src={client.connectedChannel.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=50'} 
                            className="w-7 h-7 rounded-lg object-cover" 
                            alt=""
                          />
                          <div>
                            <p className="font-bold text-slate-900 truncate max-w-[120px]">{client.connectedChannel.title}</p>
                            <p className="text-[10px] text-emerald-600">{client.connectedChannel.subscribers} subs</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not Connected</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 uppercase">{client.subscriptionPlan}</p>
                      <p className="text-[10px] text-slate-400">Exp: {new Date(client.subscriptionExpiry).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900">{client.totalComments}</span> / <span className="font-bold text-emerald-600">{client.totalAiReplies}</span> / <span className="font-bold text-teal-600">{client.totalLeads}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/clients/${client._id}`)}
                          className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => setEditModalClient(client)}
                          className="p-2 hover:bg-slate-100 rounded-xl text-emerald-600 transition-colors"
                          title="Edit Client"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          onClick={() => handleToggleBlock(client)}
                          className={`p-2 hover:bg-amber-50 rounded-xl transition-colors ${client.status === 'blocked' ? 'text-emerald-600' : 'text-amber-600'}`}
                          title={client.status === 'blocked' ? 'Unblock Client' : 'Block Client'}
                        >
                          <Ban size={16} />
                        </button>

                        <button
                          onClick={() => setDeleteModalClient(client)}
                          className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-colors"
                          title="Delete Account"
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

      {/* Edit Client Modal */}
      <AnimatePresence>
        {editModalClient && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-garden-card p-6 rounded-[28px] max-w-md w-full text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h3 className="text-base font-bold text-slate-900">Edit Client Profile</h3>
                <button onClick={() => setEditModalClient(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editModalClient.name}
                    onChange={(e) => setEditModalClient({ ...editModalClient, name: e.target.value })}
                    className="w-full glass-input py-2.5 px-3 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editModalClient.email}
                    onChange={(e) => setEditModalClient({ ...editModalClient, email: e.target.value })}
                    className="w-full glass-input py-2.5 px-3 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Account Status</label>
                  <select
                    value={editModalClient.status}
                    onChange={(e) => setEditModalClient({ ...editModalClient, status: e.target.value })}
                    className="w-full glass-input py-2.5 px-3 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditModalClient(null)}
                    className="btn-glass-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-glass-primary text-xs py-2 px-5"
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
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-garden-card p-6 rounded-[28px] max-w-sm w-full text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Client Account?</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Are you sure you want to permanently delete <strong>{deleteModalClient.name}</strong>? This action will cascade delete all connected YouTube channels, subscriptions, and logs.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeleteModalClient(null)}
                  className="btn-glass-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-5 rounded-full transition-all"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Delete Client'}
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
