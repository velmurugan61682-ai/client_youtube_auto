import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Key,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  Code,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  LogOut,
  Database,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Get API base URL dynamically
const getBaseURL = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return 'https://server-youtube-auto.onrender.com';
};

const API_BASE_URL = getBaseURL();

const AdminPortal = () => {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // API Key Access State
  const [apiKeys, setApiKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [openDocSection, setOpenDocSection] = useState(null);

  // Connected Users State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [activeTab, setActiveTab] = useState('keys');

  // Configure Axios Instance for Admin requests
  const adminApi = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
      Authorization: adminToken ? `Bearer ${adminToken}` : '',
      'Content-Type': 'application/json'
    }
  });

  const loadUsers = async () => {
    if (!adminToken) return;
    setLoadingUsers(true);
    try {
      const res = await adminApi.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadSubscriptions = async () => {
    if (!adminToken) return;
    setLoadingSubscriptions(true);
    try {
      const res = await adminApi.get('/admin/subscriptions');
      setSubscriptions(res.data);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const loadPayments = async () => {
    if (!adminToken) return;
    setLoadingPayments(true);
    try {
      const res = await adminApi.get('/admin/payments');
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleActivateSub = async (userId, email) => {
    if (!window.confirm(`Activate subscription manually for user ${email}?`)) return;
    try {
      await adminApi.post(`/admin/subscriptions/${userId}/activate`, { planType: 'professional', durationDays: 30 });
      alert(`Subscription activated for ${email}`);
      loadSubscriptions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to activate subscription');
    }
  };

  const handleCancelSub = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to cancel subscription for ${email}?`)) return;
    try {
      await adminApi.post(`/admin/subscriptions/${userId}/cancel`);
      alert(`Subscription cancelled for ${email}`);
      loadSubscriptions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel subscription');
    }
  };

  const handleExtendSub = async (userId, email) => {
    const daysStr = window.prompt(`Enter number of days to extend subscription for ${email}:`, '30');
    if (!daysStr) return;
    const days = parseInt(daysStr);
    if (isNaN(days) || days <= 0) return alert('Invalid number of days.');
    try {
      await adminApi.post(`/admin/subscriptions/${userId}/extend`, { days });
      alert(`Subscription extended by ${days} days for ${email}`);
      loadSubscriptions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to extend subscription');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`WARNING: Are you sure you want to permanently delete user account "${name}"? This action is irreversible and will delete all their connected YouTube channels, automated comments history, leads, and active settings.`)) {
      return;
    }
    try {
      const res = await adminApi.delete(`/admin/users/${id}`);
      if (res.data.success) {
        window.alert(`User account "${name}" successfully deleted.`);
        loadUsers();
      }
    } catch (err) {
      window.alert(err.response?.data?.error || 'Failed to delete user account');
    }
  };

  useEffect(() => {
    if (adminToken) {
      setIsAdminAuth(true);
      loadApiKeys();
      loadUsers();
      loadSubscriptions();
      loadPayments();
    }
  }, [adminToken]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/login`, { username, password });
      if (res.data.success) {
        const token = res.data.token;
        localStorage.setItem('adminToken', token);
        setAdminToken(token);
        setIsAdminAuth(true);
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      setLoginError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken('');
    setIsAdminAuth(false);
    setApiKeys([]);
    setGeneratedKey(null);
  };

  const loadApiKeys = async () => {
    if (!adminToken) return;
    setLoadingKeys(true);
    try {
      const res = await adminApi.get('/admin/api-keys');
      setApiKeys(res.data);
    } catch (err) {
      console.error('Failed to load admin API keys:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const res = await adminApi.post('/admin/api-keys', { name: newKeyName });
      if (res.data.success) {
        setGeneratedKey(res.data.apiKey);
        setNewKeyName('');
        loadApiKeys();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate API Key');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (id) => {
    if (!confirm('Are you sure you want to revoke and delete this Global API Key? Any external systems using it will immediately lose access.')) {
      return;
    }
    try {
      const res = await adminApi.delete(`/admin/api-keys/${id}`);
      if (res.data.success) {
        loadApiKeys();
        if (generatedKey && generatedKey._id === id) {
          setGeneratedKey(null);
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to revoke API Key');
    }
  };

  const handleCopyKey = (keyText, id) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Dynamic Animated BG */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-950/20 via-slate-950 to-slate-950 pointer-events-none z-0" />

      {/* Header Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/25 flex items-center justify-center font-black">
            A
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white uppercase">App Owner Dashboard</h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Internal Admin Console</p>
          </div>
        </div>

        {isAdminAuth && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-900 transition-all cursor-pointer"
          >
            <LogOut size={13} />
            Exit Portal
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <AnimatePresence mode="wait">
          {!isAdminAuth ? (
            /* Login Screen */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-[32px] p-8 shadow-2xl backdrop-blur-md"
            >
              <div className="text-center space-y-2 mb-8">
                <div className="mx-auto w-12 h-12 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-2xl flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-black tracking-tight text-white uppercase">Owner Login</h2>
                <p className="text-xs text-slate-400 font-medium">Verify system administration credentials</p>
              </div>

              {loginError && (
                <div className="mb-6 p-4 bg-red-950/30 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider ml-1">Username</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter admin username"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-teal-500/50 focus:bg-slate-950 transition-all outline-none shadow-inner"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider ml-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-teal-500/50 focus:bg-slate-950 transition-all outline-none shadow-inner"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-4 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 cursor-pointer mt-6"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Verifying...
                    </>
                  ) : (
                    'Enter Console'
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            /* Dashboard Console */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-6xl space-y-6 animate-in fade-in duration-500"
            >
              {/* Tab Navigation */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-900 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('keys')}
                  className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeTab === 'keys' 
                      ? 'border-teal-500 text-white font-black' 
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  API Keys & Integrations
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeTab === 'users' 
                      ? 'border-teal-500 text-white font-black' 
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Connected Clients ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('subscriptions')}
                  className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeTab === 'subscriptions' 
                      ? 'border-teal-500 text-white font-black' 
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Subscriptions ({subscriptions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeTab === 'payments' 
                      ? 'border-teal-500 text-white font-black' 
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Payment History ({payments.length})
                </button>
              </div>


              {/* Generated Key Warning Alert */}
              {generatedKey && (
                <div className="bg-amber-950/20 border border-amber-500/25 rounded-[28px] p-6 shadow-2xl mb-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <AlertCircle size={20} />
                    </div>
                    <div className="flex-1 space-y-3 text-left">
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">New API Key Created!</h4>
                      <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                        For security reasons, this key will only be shown to you <span className="font-bold underline text-amber-400">once</span>. Copy it now and store it in a safe place. If lost, you will need to generate a new key.
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
                        <div className="flex-1 bg-slate-950 border border-amber-500/20 px-4 py-2.5 rounded-xl font-mono text-xs select-all break-all text-slate-200 font-semibold shadow-inner">
                          {generatedKey.key}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyKey(generatedKey.key, 'generated')}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                        >
                          {copiedKeyId === 'generated' ? (
                            <>
                              <CheckCircle2 size={14} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copy Key
                            </>
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGeneratedKey(null)}
                        className="text-[10px] font-black text-amber-400 hover:text-amber-300 uppercase tracking-widest pt-2 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        I have copied the key, close warning
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'keys' ? (
                <>
                  {/* API Keys Table & Generator */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Key Generator Card */}
                    <div className="lg:col-span-1 bg-slate-900/35 border border-slate-900 rounded-[32px] p-6 shadow-xl backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-900">
                        <div className="w-10 h-10 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <Plus size={18} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">Create API Key</h4>
                          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Generate global keys</p>
                        </div>
                      </div>

                      <form onSubmit={handleGenerateKey} className="space-y-4 text-left">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider ml-1">Key Label Name</label>
                          <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="e.g. Sales Team integration..."
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-teal-500/30 transition-all outline-none"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={creatingKey}
                          className="w-full py-3 bg-teal-505 hover:bg-teal-400 disabled:bg-slate-800 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {creatingKey ? (
                            <>
                              <Loader2 className="animate-spin" size={14} />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Plus size={14} />
                              Generate Key
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Keys List Card */}
                    <div className="lg:col-span-2 bg-slate-900/35 border border-slate-900 rounded-[32px] p-6 shadow-xl backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-900">
                        <div className="w-10 h-10 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <Key size={18} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">Active Global Keys</h4>
                          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">System-wide inspection tokens</p>
                        </div>
                      </div>

                      {loadingKeys ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-teal-400" size={24} />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Syncing keys...</span>
                        </div>
                      ) : apiKeys.length === 0 ? (
                        <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl">
                          <Info size={28} className="mx-auto text-slate-700 mb-2" />
                          <p className="text-xs font-bold text-slate-400 mb-1">No API keys created yet</p>
                          <p className="text-[10px] font-semibold text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                            Keys generated here allow global system-wide read access to all user profiles and customer leads.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-semibold text-nowrap">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[9px] font-black">
                                <th className="pb-3 pl-2">Key Details</th>
                                <th className="pb-3">Token Value</th>
                                <th className="pb-3">Last Used</th>
                                <th className="pb-3 text-right pr-2">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900/50">
                              {apiKeys.map((k) => (
                                <tr key={k._id} className="text-slate-300">
                                  <td className="py-3.5 pl-2 text-left">
                                    <p className="font-black text-white text-xs">{k.name}</p>
                                    <p className="text-[9px] font-semibold text-slate-500">Created: {new Date(k.createdAt).toLocaleDateString()}</p>
                                  </td>
                                  <td className="py-3.5 font-mono text-[10px] text-slate-400 select-all text-left">
                                    {k.key}
                                  </td>
                                  <td className="py-3.5 text-slate-400 text-[10px] text-left">
                                    {k.lastUsedAt ? (
                                      new Date(k.lastUsedAt).toLocaleString()
                                    ) : (
                                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 bg-slate-900/50 border border-slate-800 px-1.5 py-0.5 rounded">Never</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 text-right pr-2">
                                    <button
                                      type="button"
                                      onClick={() => handleRevokeKey(k._id)}
                                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-colors cursor-pointer"
                                      title="Revoke Token"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Developer Integration Docs */}
                  <div className="bg-slate-900/35 border border-slate-900 rounded-[32px] p-6 md:p-8 shadow-xl backdrop-blur-md text-left">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-900">
                      <div className="w-10 h-10 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <Code size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">System Integration Guide</h4>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Global API specifications</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Authentication Box */}
                      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 text-xs font-semibold space-y-2">
                        <h5 className="font-black text-white">Authentication</h5>
                        <p className="text-slate-400 leading-relaxed">
                          All system integration requests require your generated Global API Key passed in the header:
                        </p>
                        <pre className="bg-slate-900/50 border border-slate-850 text-teal-400 p-3.5 rounded-xl font-mono text-[10px] overflow-x-auto shadow-inner leading-relaxed">
                          {"x-api-key: your_global_key_here\n// OR\nAuthorization: Bearer your_global_key_here"}
                        </pre>
                      </div>

                      {/* Accordion Sections */}
                      {[
                        {
                          id: 'get-users',
                          title: '1. Retrieve Registered Users (GET /api/external/users)',
                          desc: 'Fetches profile, registration details, and subscription states for all accounts currently using the platform.',
                          url: `${API_BASE_URL}/api/external/users`,
                          method: 'GET',
                          payload: null,
                          curl: (key) => `curl -X GET "${API_BASE_URL}/api/external/users" \\\n  -H "x-api-key: ${key}"`,
                          fetch: (key) => `fetch('${API_BASE_URL}/api/external/users', {\n  method: 'GET',\n  headers: {\n    'x-api-key': '${key}'\n  }\n})\n.then(res => res.json())\n.then(data => console.log(data));`
                        },
                        {
                          id: 'get-leads',
                          title: '2. Retrieve System Leads Data (GET /api/external/leads)',
                          desc: 'Fetches all customer leads across the entire application, populated with the user details (name, email) who owns them.',
                          url: `${API_BASE_URL}/api/external/leads`,
                          method: 'GET',
                          payload: null,
                          curl: (key) => `curl -X GET "${API_BASE_URL}/api/external/leads" \\\n  -H "x-api-key: ${key}"`,
                          fetch: (key) => `fetch('${API_BASE_URL}/api/external/leads', {\n  method: 'GET',\n  headers: {\n    'x-api-key': '${key}'\n  }\n})\n.then(res => res.json())\n.then(data => console.log(data));`
                        }
                      ].map(doc => (
                        <div key={doc.id} className="border border-slate-900 rounded-2xl overflow-hidden bg-slate-905/30">
                          <button
                            type="button"
                            onClick={() => setOpenDocSection(openDocSection === doc.id ? null : doc.id)}
                            className="w-full flex items-center justify-between p-4 bg-slate-900/30 hover:bg-slate-900/50 transition-colors text-xs font-black text-white cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[8px] uppercase font-black tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/15">{doc.method}</span>
                              <span>{doc.title}</span>
                            </div>
                            <ChevronDown size={14} className={`text-slate-500 transition-transform ${openDocSection === doc.id ? 'rotate-180' : ''}`} />
                          </button>

                          {openDocSection === doc.id && (
                            <div className="p-5 border-t border-slate-900 bg-slate-950/40 text-xs font-semibold space-y-4 animate-in fade-in duration-200">
                              <p className="text-slate-400 leading-relaxed font-sans">{doc.desc}</p>
                              <div>
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Target Endpoint URL</span>
                                <code className="bg-slate-900 border border-slate-850 px-2 py-1 rounded font-mono text-[10px] text-slate-200 block break-all font-semibold w-fit select-all">{doc.url}</code>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Curl Example</span>
                                  <pre className="bg-slate-900/50 border border-slate-850 text-slate-300 p-3 rounded-xl font-mono text-[9px] overflow-x-auto shadow-inner leading-relaxed whitespace-pre-wrap select-all">
                                    {doc.curl(apiKeys[0]?.key || 'your_global_api_key')}
                                  </pre>
                                </div>
                                <div>
                                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">JS Fetch Example</span>
                                  <pre className="bg-slate-900/50 border border-slate-850 text-slate-300 p-3 rounded-xl font-mono text-[9px] overflow-x-auto shadow-inner leading-relaxed whitespace-pre-wrap select-all">
                                    {doc.fetch(apiKeys[0]?.key || 'your_global_api_key')}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : activeTab === 'users' ? (
                /* Connected Clients Tab */
                <div className="bg-slate-900/35 border border-slate-900 rounded-[32px] p-6 shadow-xl backdrop-blur-md">

                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <Database size={18} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Connected Clients</h4>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Inspect and manage registered accounts</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={loadUsers}
                      className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {loadingUsers ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                      Reload Users
                    </button>
                  </div>

                  {loadingUsers ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-teal-400" size={24} />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Loading client profiles...</span>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl">
                      <Info size={32} className="mx-auto text-slate-700 mb-2" />
                      <p className="text-xs font-bold text-slate-400">No client accounts registered yet</p>
                      <p className="text-[10px] font-semibold text-slate-500 max-w-[280px] mx-auto leading-relaxed mt-1">
                        New users will automatically appear here as they register on the sign-up page.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-semibold text-nowrap">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[9px] font-black">
                            <th className="pb-3 pl-2">Client Details</th>
                            <th className="pb-3">Email Address</th>
                            <th className="pb-3">Registered On</th>
                            <th className="pb-3">Subscription</th>
                            <th className="pb-3 text-center">Channels</th>
                            <th className="pb-3 text-center">Active Rules</th>
                            <th className="pb-3 text-center">Leads</th>
                            <th className="pb-3 text-right pr-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/50">
                          {users.map((u) => (
                            <tr key={u._id} className="text-slate-300">
                              <td className="py-3.5 pl-2 text-left">
                                <p className="font-black text-white text-xs">{u.name}</p>
                                <p className="text-[9px] font-semibold text-slate-500">ID: {u._id}</p>
                              </td>
                              <td className="py-3.5 text-left font-semibold text-slate-300">
                                {u.email}
                              </td>
                              <td className="py-3.5 text-left text-slate-400 text-[10px]">
                                {new Date(u.createdAt).toLocaleString()}
                              </td>
                              <td className="py-3.5 text-left">
                                {u.subscription?.status === 'active' ? (
                                  <span className="bg-green-500/10 text-green-400 border border-green-500/15 px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-black">
                                    Active (Pro)
                                  </span>
                                ) : (
                                  <span className="bg-slate-950 text-slate-500 border border-slate-855 px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-black">
                                    No Plan (Free)
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 text-center font-bold text-teal-400">
                                {u.channelCount}
                              </td>
                              <td className="py-3.5 text-center font-bold text-slate-300">
                                {u.ruleCount}
                              </td>
                              <td className="py-3.5 text-center font-bold text-[#ff0000]">
                                {u.leadCount}
                              </td>
                              <td className="py-3.5 text-right pr-2">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u._id, u.name)}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-colors cursor-pointer"
                                  title="Delete User Account"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : activeTab === 'subscriptions' ? (
                /* Subscriptions Management Tab */
                <div className="bg-slate-900/35 border border-slate-900 rounded-[32px] p-6 shadow-xl backdrop-blur-md">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <Database size={18} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Client Subscriptions Management</h4>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Inspect plans, statuses, and manual controls</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={loadSubscriptions}
                      className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {loadingSubscriptions ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                      Refresh
                    </button>
                  </div>

                  {loadingSubscriptions ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-teal-400" size={24} />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Loading subscriptions...</span>
                    </div>
                  ) : subscriptions.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl">
                      <Info size={32} className="mx-auto text-slate-700 mb-2" />
                      <p className="text-xs font-bold text-slate-400">No subscriptions found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-semibold text-nowrap">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[9px] font-black">
                            <th className="pb-3 pl-2">Client Name</th>
                            <th className="pb-3">Email Address</th>
                            <th className="pb-3">Plan</th>
                            <th className="pb-3">Payment Status</th>
                            <th className="pb-3">Expiry Date</th>
                            <th className="pb-3">Razorpay Sub ID</th>
                            <th className="pb-3 text-right pr-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/50">
                          {subscriptions.map((s) => (
                            <tr key={s.userId} className="text-slate-300">
                              <td className="py-3.5 pl-2 font-black text-white text-xs text-left">
                                {s.clientName}
                              </td>
                              <td className="py-3.5 text-left text-slate-400 text-xs">
                                {s.email}
                              </td>
                              <td className="py-3.5 text-left font-bold text-teal-400 uppercase text-[10px]">
                                {s.plan}
                              </td>
                              <td className="py-3.5 text-left">
                                {s.status === 'active' ? (
                                  <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-black">
                                    {s.paymentStatus || 'Active'}
                                  </span>
                                ) : (
                                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-black">
                                    {s.status}
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 text-left text-slate-400 text-[10px]">
                                {new Date(s.expiryDate).toLocaleDateString()}
                              </td>
                              <td className="py-3.5 text-left font-mono text-[10px] text-slate-400 select-all">
                                {s.razorpaySubscriptionId}
                              </td>
                              <td className="py-3.5 text-right pr-2 space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleActivateSub(s.userId, s.email)}
                                  className="px-2 py-1 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-md font-bold uppercase transition-all cursor-pointer"
                                >
                                  Activate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExtendSub(s.userId, s.email)}
                                  className="px-2 py-1 text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded-md font-bold uppercase transition-all cursor-pointer"
                                >
                                  Extend
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCancelSub(s.userId, s.email)}
                                  className="px-2 py-1 text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-md font-bold uppercase transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                /* Payments History Tab */
                <div className="bg-slate-900/35 border border-slate-900 rounded-[32px] p-6 shadow-xl backdrop-blur-md">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <Database size={18} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">System Payment History</h4>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">All processed transactions and Razorpay IDs</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={loadPayments}
                      className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {loadingPayments ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                      Refresh
                    </button>
                  </div>

                  {loadingPayments ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-teal-400" size={24} />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Loading payments...</span>
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl">
                      <Info size={32} className="mx-auto text-slate-700 mb-2" />
                      <p className="text-xs font-bold text-slate-400">No payments recorded yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-semibold text-nowrap">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[9px] font-black">
                            <th className="pb-3 pl-2">Client Details</th>
                            <th className="pb-3">Payment ID</th>
                            <th className="pb-3">Subscription ID</th>
                            <th className="pb-3">Amount</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/50">
                          {payments.map((p) => (
                            <tr key={p._id} className="text-slate-300">
                              <td className="py-3.5 pl-2 text-left">
                                <p className="font-black text-white text-xs">{p.userId?.name || 'Unknown User'}</p>
                                <p className="text-[9px] text-slate-500">{p.userId?.email}</p>
                              </td>
                              <td className="py-3.5 font-mono text-[10px] text-slate-300 select-all text-left">
                                {p.razorpayPaymentId}
                              </td>
                              <td className="py-3.5 font-mono text-[10px] text-slate-400 select-all text-left">
                                {p.razorpaySubscriptionId || p.subscriptionId || 'N/A'}
                              </td>
                              <td className="py-3.5 text-left font-bold text-emerald-400">
                                ₹{(p.amount / 100).toFixed(2)} {p.currency}
                              </td>
                              <td className="py-3.5 text-left">
                                <span className={`px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-black ${
                                  p.status === 'captured' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-3.5 text-left text-slate-400 text-[10px]">
                                {new Date(p.createdAt || p.paymentDate).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};


export default AdminPortal;
