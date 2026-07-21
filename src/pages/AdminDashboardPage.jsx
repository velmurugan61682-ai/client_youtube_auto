import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  Bot, 
  Search, 
  Filter, 
  Bell, 
  LogOut, 
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, usersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/clients')
      ]);

      if (analyticsRes.data.success) {
        setMetrics(analyticsRes.data.metrics);
      }
      if (usersRes.data.success) {
        const rawUsers = usersRes.data.clients || usersRes.data.users || [];
        const formattedUsers = rawUsers.map((u) => ({
          ...u,
          initial: u.name?.charAt(0).toUpperCase() || 'U',
          tenantId: u.tenantId || `T-${(u._id || u.id || '').substring(0, 5).toUpperCase()}`,
          agent: u.assignedAgent || 'AI agent'
        }));
        setUsers(formattedUsers);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Inline Plan Update (Free <-> Pro)
  const handlePlanChange = async (user, newPlan) => {
    try {
      setActionLoadingId(user._id);
      await api.patch(`/admin/subscriptions/${user._id}`, {
        plan: newPlan === 'Pro' ? 'quarterly_pro' : 'free',
        status: 'active'
      });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, plan: newPlan === 'Pro' ? 'quarterly_pro' : 'free' } : u));
    } catch (err) {
      alert('Failed to update plan');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Inline Agent Update (AI agent <-> Human agent)
  const handleAgentChange = async (user, newAgent) => {
    try {
      setActionLoadingId(user._id);
      const agentTypeVal = newAgent === 'Human agent' ? 'human_agent' : 'ai_agent';
      await api.patch(`/admin/clients/${user._id}`, { 
        assignedAgent: newAgent,
        assignedAgentType: agentTypeVal
      });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, agent: newAgent, assignedAgent: newAgent } : u));
    } catch (err) {
      alert('Failed to update agent');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Block / Unblock Account Action
  const handleToggleBlock = async (user) => {
    const isCurrentlyActive = user.status === 'active';
    const newStatus = isCurrentlyActive ? 'suspended' : 'active';
    try {
      setActionLoadingId(user._id);
      await api.patch(`/admin/clients/${user._id}`, { status: newStatus });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert('Failed to update account status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyTenantId = (tenantId, id) => {
    navigator.clipboard.writeText(tenantId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter(u => {
    const query = search.toLowerCase();
    const matchesSearch = !search || 
                          u.name?.toLowerCase().includes(query) || 
                          u.email?.toLowerCase().includes(query) ||
                          u.tenantId?.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && u.status === 'active') ||
                          (statusFilter === 'blocked' && (u.status === 'suspended' || u.status === 'blocked'));
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-slate-600" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 text-slate-800 font-sans space-y-6">
      {/* 1. Header Bar matching screenshot exactly */}
      <div className="flex items-center justify-between pb-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin dashboard</h1>

        <div className="flex items-center gap-4">
          {/* Bell icon */}
          <button className="text-slate-500 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
            <Bell size={20} />
          </button>
          
          {/* Avatar circle */}
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            C
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      {/* 2. Top 4 Stat Cards matching screenshot exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total users */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="text-slate-600">
            <Users size={22} />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">{metrics?.totalClients || '24,567'}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Total users</p>
            <p className="text-xs font-bold text-emerald-600 mt-1.5">+15.2% last month</p>
          </div>
        </div>

        {/* Card 2: Active subscriptions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="text-amber-800">
            <CreditCard size={22} />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">{metrics?.activeSubscribers || '18,912'}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Active subscriptions</p>
            <p className="text-xs font-bold text-emerald-600 mt-1.5">+11.2% last month</p>
          </div>
        </div>

        {/* Card 3: AI agents */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="text-slate-700">
            <Bot size={22} />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">{metrics?.connectedChannels || '8,245'}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">AI agents</p>
            <p className="text-xs font-bold text-emerald-600 mt-1.5">+15.7% last month</p>
          </div>
        </div>

        {/* Card 4: Monthly revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="text-amber-800 font-extrabold text-xl">
            ₹
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">₹{(metrics?.monthlyRevenue || 125780).toLocaleString()}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Monthly revenue</p>
            <p className="text-xs font-bold text-emerald-600 mt-1.5">+11.7% last month</p>
          </div>
        </div>
      </div>

      {/* 3. Users Overview Table Section matching screenshot exactly */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        {/* Table Top Header and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Users overview</h2>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 transition-colors shadow-sm"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'all' ? 'active' : 'all')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 text-xs font-bold text-slate-500">
                <th className="pb-3 px-3">Name</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Plan</th>
                <th className="pb-3 px-3">Agent</th>
                <th className="pb-3 px-3">Joined</th>
                <th className="pb-3 px-3">Tenant</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-normal">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const isBlocked = user.status === 'suspended' || user.status === 'blocked';
                  const isProPlan = user.plan === 'quarterly_pro' || user.plan === 'annual_pro' || user.plan === 'Pro';
                  const isHumanAgent = user.agent === 'Human agent' || user.assignedAgent === 'Human Agent';

                  const avatarColors = [
                    'bg-blue-100 text-blue-700',
                    'bg-sky-100 text-sky-700',
                    'bg-indigo-100 text-indigo-700',
                    'bg-teal-100 text-teal-700'
                  ];
                  const avatarColorClass = avatarColors[idx % avatarColors.length];

                  return (
                    <tr key={user._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name with Letter Avatar */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${avatarColorClass}`}>
                            {user.initial}
                          </div>
                          <span className="font-bold text-slate-900">{user.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-3 text-slate-500">
                        {user.email}
                      </td>

                      {/* Status Pill Badge */}
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isBlocked 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>

                      {/* Plan Dropdown */}
                      <td className="py-4 px-3">
                        <select
                          value={isProPlan ? 'Pro' : 'Free'}
                          onChange={(e) => handlePlanChange(user, e.target.value)}
                          disabled={actionLoadingId === user._id}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:border-slate-300 shadow-sm"
                        >
                          <option value="Free">Free</option>
                          <option value="Pro">Pro</option>
                        </select>
                      </td>

                      {/* Agent Dropdown */}
                      <td className="py-4 px-3">
                        <select
                          value={isHumanAgent ? 'Human agent' : 'AI agent'}
                          onChange={(e) => handleAgentChange(user, e.target.value)}
                          disabled={actionLoadingId === user._id}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:border-slate-300 shadow-sm"
                        >
                          <option value="AI agent">AI agent</option>
                          <option value="Human agent">Human agent</option>
                        </select>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-3 text-slate-500">
                        {new Date(user.createdAt).toISOString().split('T')[0]}
                      </td>

                      {/* Tenant ID */}
                      <td className="py-4 px-3 text-slate-600 font-mono text-xs">
                        <div className="flex items-center gap-1">
                          <span>{user.tenantId}</span>
                          <button 
                            onClick={() => handleCopyTenantId(user.tenantId, user._id)}
                            className="p-1 hover:text-slate-900 text-slate-400"
                            title="Copy Tenant ID"
                          >
                            {copiedId === user._id ? <Check size={12} className="text-emerald-600" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/clients/${user._id}`)}
                            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl shadow-sm transition-all"
                          >
                            View
                          </button>

                          <button
                            onClick={() => handleToggleBlock(user)}
                            disabled={actionLoadingId === user._id}
                            className={`px-4 py-1.5 text-xs font-bold rounded-xl shadow-sm transition-all ${
                              isBlocked
                                ? 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50'
                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                            }`}
                          >
                            {isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
