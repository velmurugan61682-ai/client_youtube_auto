import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  Bot,
  Search,
  Filter,
  Bell,
  Loader2,
  Copy,
  Check,
  ListTodo,
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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('adminDashboardTheme') === 'dark');
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();
  useAuth();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, usersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/clients')
      ]);

      if (analyticsRes.data.success) setMetrics(analyticsRes.data.metrics);
      if (usersRes.data.success) {
        const rawUsers = usersRes.data.clients || usersRes.data.users || [];
        setUsers(rawUsers.map((u) => ({
          ...u,
          initial: u.name?.charAt(0).toUpperCase() || 'U',
          tenantId: u.tenantId || `T-${(u._id || u.id || '').substring(0, 5).toUpperCase()}`,
          agent: u.assignedAgent || 'AI agent'
        })));
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

  useEffect(() => {
    const syncTheme = (event) => {
      if (event?.detail && typeof event.detail.dark === 'boolean') {
        setDarkMode(event.detail.dark);
        return;
      }
      setDarkMode(localStorage.getItem('adminDashboardTheme') === 'dark');
    };

    window.addEventListener('admin-dashboard-theme-change', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('admin-dashboard-theme-change', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

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

  const handleAgentChange = async (user, newAgent) => {
    try {
      setActionLoadingId(user._id);
      await api.patch(`/admin/clients/${user._id}`, {
        assignedAgent: newAgent,
        assignedAgentType: newAgent === 'Human agent' ? 'human_agent' : 'ai_agent'
      });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, agent: newAgent, assignedAgent: newAgent } : u));
    } catch (err) {
      alert('Failed to update agent');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleBlock = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
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

  const totalUsers = metrics?.totalClients || users.length || 0;
  const activeSubscribers = metrics?.activeSubscribers || users.filter(u => ['quarterly_pro', 'annual_pro', 'Pro'].includes(u.plan)).length || 0;
  const connectedChannels = metrics?.connectedChannels || 0;
  const monthlyRevenue = metrics?.monthlyRevenue || activeSubscribers * 999;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const blockedUsers = users.filter(u => u.status === 'blocked' || u.status === 'suspended').length;
  const visibleUsers = filteredUsers.slice(0, 8);

  const theme = darkMode ? {
    shell: 'bg-[#0f0f0f] text-white',
    panel: 'bg-[#181818] border-[#2a2a2a]',
    soft: 'bg-[#202020] border-[#2f2f2f]',
    muted: 'text-[#aaaaaa]',
    text: 'text-white',
    input: 'bg-[#202020] border-[#2f2f2f] text-white placeholder:text-[#777777]',
    tableHead: 'bg-[#202020] text-[#aaaaaa] border-[#2f2f2f]',
    row: 'hover:bg-[#202020]',
  } : {
    shell: 'bg-[#eef3f5] text-[#0f0f0f]',
    panel: 'bg-white border-[#e5e5e5]',
    soft: 'bg-[#f7f7f7] border-[#ededed]',
    muted: 'text-[#606060]',
    text: 'text-[#0f0f0f]',
    input: 'bg-[#f2f2f2] border-transparent text-[#0f0f0f] placeholder:text-[#777777]',
    tableHead: 'bg-[#f7f7f7] text-[#606060] border-[#ededed]',
    row: 'hover:bg-[#f7f7f7]',
  };

  const tasks = [
    { name: 'Client onboarding review', admin: visibleUsers[0]?.name || 'Channel Admin', members: activeSubscribers || 3, status: 'In progress', runtime: '6 hours', finish: 'Today' },
    { name: 'Payment verification queue', admin: visibleUsers[1]?.name || 'Billing Admin', members: blockedUsers + 2, status: 'Done', runtime: '2 hours', finish: 'Tomorrow' },
    { name: 'YouTube channel health audit', admin: visibleUsers[2]?.name || 'AI Agent', members: connectedChannels || 10, status: 'In progress', runtime: '3 days', finish: 'Friday' },
    { name: 'Creator support follow-up', admin: visibleUsers[3]?.name || 'Support Team', members: filteredUsers.length || 7, status: 'In progress', runtime: '1 week', finish: 'Sunday' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-[#ff0000]" size={36} />
      </div>
    );
  }

  return (
    <div className={`h-[calc(100vh-2.5rem)] min-h-[720px] overflow-hidden rounded-[28px] p-3 sm:p-4 transition-colors ${theme.shell}`}>
      <section className="min-w-0 overflow-hidden flex h-full flex-col gap-4">
        <div className={`${theme.panel} rounded-[22px] border p-3 sm:p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between`}>
          <div className={`relative w-full md:max-w-sm rounded-full ${theme.input}`}>
            <Search className="absolute right-4 top-1/2 -translate-y-1/2" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients, tenant, email"
              className="w-full bg-transparent py-3 pl-5 pr-12 text-xs font-semibold outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setStatusFilter(statusFilter === 'all' ? 'active' : statusFilter === 'active' ? 'blocked' : 'all')}
              className={`flex items-center gap-2 rounded-full border px-4 py-3 text-xs font-black transition-colors ${theme.soft}`}
            >
              <Filter size={14} /> {statusFilter === 'all' ? 'All clients' : statusFilter}
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(prev => !prev)}
                className={`rounded-full border p-3 transition-colors ${showNotifications ? 'bg-[#fff1f1] border-red-100 text-[#ff0000]' : theme.soft}`}
                title="Notifications"
              >
                <Bell size={16} />
              </button>
              {showNotifications && (
                <div className={`absolute right-0 top-full z-50 mt-3 w-[min(320px,calc(100vw-2rem))] rounded-2xl border p-4 shadow-2xl ${darkMode ? 'bg-[#181818] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'}`}>
                  <div className="flex items-center justify-between border-b border-current/10 pb-3">
                    <p className={`text-sm font-black ${theme.text}`}>Notifications</p>
                    <span className="rounded-full bg-[#fff1f1] px-2 py-0.5 text-[10px] font-black text-[#ff0000]">Live</span>
                  </div>
                  <div className="space-y-2 pt-3">
                    {[
                      { title: 'Client sync complete', text: `${totalUsers} client records are available.` },
                      { title: 'Subscribers active', text: `${activeSubscribers} paid subscribers currently tracked.` },
                      { title: 'Channels monitored', text: `${connectedChannels} YouTube channels connected.` }
                    ].map(item => (
                      <div key={item.title} className={`rounded-xl border p-3 ${darkMode ? 'border-[#2a2a2a] bg-[#202020]' : 'border-[#ededed] bg-[#f7f7f7]'}`}>
                        <p className={`text-xs font-black ${theme.text}`}>{item.title}</p>
                        <p className={`mt-1 text-[11px] font-semibold ${theme.muted}`}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="custom-scroll min-h-0 flex-1 overflow-y-auto pr-1 space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className={`${theme.panel} rounded-[22px] border p-5 sm:p-7 shadow-sm`}>
              <div className="flex flex-col gap-4 border-b border-current/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className={`text-3xl font-black tracking-tight ${theme.text}`}>Last tasks</h1>
                  <p className={`mt-1 text-xs font-semibold ${theme.muted}`}><span className={theme.text}>{filteredUsers.length}</span> clients, proceed to resolve them</p>
                </div>
                <div className="flex items-center gap-8">
                  <div><p className={`text-3xl font-black ${theme.text}`}>{activeUsers}</p><p className={`text-xs font-semibold ${theme.muted}`}>Active</p></div>
                  <div className="h-11 w-px bg-current/10" />
                  <div><p className={`text-3xl font-black ${theme.text}`}>{blockedUsers}</p><p className={`text-xs font-semibold ${theme.muted}`}>Blocked</p></div>
                </div>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className={`${theme.tableHead} border-b text-[11px] font-black`}>
                      <th className="w-10 py-3 pl-1"><div className="h-4 w-4 rounded border border-current/20" /></th>
                      <th className="py-3">Name</th>
                      <th className="py-3">Admin</th>
                      <th className="py-3">Members</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Run time</th>
                      <th className="py-3 pr-1">Finish date</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold">
                    {tasks.map((task) => (
                      <tr key={task.name} className={`border-b border-current/10 ${theme.row}`}>
                        <td className="py-4 pl-1"><div className="h-4 w-4 rounded border border-current/20" /></td>
                        <td className={`py-4 font-black ${theme.text}`}>{task.name}</td>
                        <td className="py-4"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-[#ff0000] text-white flex items-center justify-center text-[10px] font-black">{task.admin.charAt(0).toUpperCase()}</div><span className={theme.muted}>{task.admin}</span></div></td>
                        <td className={`py-4 ${theme.text}`}>{task.members}</td>
                        <td className="py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ${task.status === 'Done' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fff1f1] text-[#cc0000]'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" /> {task.status}</span></td>
                        <td className={theme.muted}>{task.runtime}</td>
                        <td className="py-4 pr-1"><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${theme.soft}`}>{task.finish}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
              <MetricCard theme={theme} icon={Users} label="Total clients" value={totalUsers} />
              <MetricCard theme={theme} icon={CreditCard} label="Subscribers" value={activeSubscribers} accent />
              <MetricCard theme={theme} icon={Bot} label="Channels" value={connectedChannels} />
              <MetricCard theme={theme} icon={ListTodo} label="Revenue" value={`INR ${monthlyRevenue.toLocaleString()}`} accent />
            </div>
          </div>

          <div className={`${theme.panel} rounded-[22px] border p-5 sm:p-6 shadow-sm`}>
            <div><h2 className={`text-lg font-black ${theme.text}`}>Users overview</h2><p className={`mt-1 text-xs font-semibold ${theme.muted}`}>Inline scrolling client management</p></div>
            <div className="mt-5 max-h-[360px] overflow-auto custom-scroll">
              <table className="w-full min-w-[920px] text-left text-xs">
                <thead className="sticky top-0 z-10"><tr className={`${theme.tableHead} border-b font-black uppercase tracking-wide`}><th className="px-3 py-3">Client</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Plan</th><th className="px-3 py-3">Agent</th><th className="px-3 py-3">Joined</th><th className="px-3 py-3">Tenant</th><th className="px-3 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-current/10 font-semibold">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={8} className={`py-10 text-center ${theme.muted}`}>No users found.</td></tr>
                  ) : filteredUsers.map((user) => {
                    const isBlocked = user.status === 'suspended' || user.status === 'blocked';
                    const isProPlan = user.plan === 'quarterly_pro' || user.plan === 'annual_pro' || user.plan === 'Pro';
                    const isHumanAgent = user.agent === 'Human agent' || user.assignedAgent === 'Human Agent';
                    return (
                      <tr key={user._id} className={theme.row}>
                        <td className="px-3 py-4"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-[#ff0000] text-white flex items-center justify-center font-black text-[11px]">{user.initial}</div><span className={`font-black ${theme.text}`}>{user.name}</span></div></td>
                        <td className={`px-3 py-4 ${theme.muted}`}>{user.email}</td>
                        <td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${isBlocked ? 'bg-[#fff1f1] text-[#cc0000]' : 'bg-[#f2f2f2] text-[#0f0f0f]'}`}>{isBlocked ? 'Blocked' : 'Active'}</span></td>
                        <td className="px-3 py-4"><select value={isProPlan ? 'Pro' : 'Free'} onChange={(e) => handlePlanChange(user, e.target.value)} disabled={actionLoadingId === user._id} className={`rounded-full border px-3 py-1.5 text-xs font-bold outline-none ${theme.soft}`}><option value="Free">Free</option><option value="Pro">Pro</option></select></td>
                        <td className="px-3 py-4"><select value={isHumanAgent ? 'Human agent' : 'AI agent'} onChange={(e) => handleAgentChange(user, e.target.value)} disabled={actionLoadingId === user._id} className={`rounded-full border px-3 py-1.5 text-xs font-bold outline-none ${theme.soft}`}><option value="AI agent">AI agent</option><option value="Human agent">Human agent</option></select></td>
                        <td className={`px-3 py-4 ${theme.muted}`}>{user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '-'}</td>
                        <td className={`px-3 py-4 font-mono ${theme.muted}`}><button onClick={() => handleCopyTenantId(user.tenantId, user._id)} className="inline-flex items-center gap-1 hover:text-[#ff0000]"><span>{user.tenantId}</span>{copiedId === user._id ? <Check size={12} /> : <Copy size={11} />}</button></td>
                        <td className="px-3 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => navigate(`/admin/clients/${user._id}`)} className={`rounded-full border px-4 py-1.5 text-xs font-black ${theme.soft}`}>View</button><button onClick={() => handleToggleBlock(user)} disabled={actionLoadingId === user._id} className={`rounded-full px-4 py-1.5 text-xs font-black ${isBlocked ? theme.soft : 'bg-[#ff0000] text-white hover:bg-[#cc0000]'}`}>{isBlocked ? 'Unblock' : 'Block'}</button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const MetricCard = ({ theme, icon: Icon, label, value, accent = false }) => (
  <div className={`${theme.panel} rounded-[22px] border p-5 shadow-sm min-w-0`}>
    <div className="flex items-center justify-between"><Icon size={20} className={accent ? 'text-[#ff0000]' : theme.muted} /><span className="text-[10px] font-black uppercase tracking-wide text-[#cc0000]">+ live</span></div>
    <p className={`mt-6 text-2xl sm:text-3xl font-black leading-tight break-words ${theme.text}`}>{value}</p>
    <p className={`mt-1 text-xs font-bold ${theme.muted}`}>{label}</p>
  </div>
);

export default AdminDashboardPage;


