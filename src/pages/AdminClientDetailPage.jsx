import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  PlaySquare, 
  Zap, 
  CreditCard, 
  Loader2,
  History,
  Activity
} from 'lucide-react';
import api from '../services/api';

const AdminClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchClientDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/clients/${id}`);
        if (res.data.success) {
          setData(res.data.client);
        }
      } catch (err) {
        console.error('Failed to load client detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClientDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#ff0000]" size={32} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 font-bold text-slate-500">
        Client record not found.
      </div>
    );
  }

  const { name, email, organization, status, createdAt, lastLoginAt, subscription = {}, metrics = {}, youtubeChannelsConnected = [], auditLogs = [] } = data;
  const history = subscription.history || [];

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/clients')}
            className="p-2 hover:bg-white/80 rounded-xl text-slate-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{name}</h1>
            <p className="text-xs font-semibold text-slate-500">
              {email} {organization ? `• ${organization}` : ''} &bull; Client ID: {data.id || data._id}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
          status === 'active' ? 'bg-[#fff1f1] text-[#0f0f0f] border border-red-100' : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {status}
        </span>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'profile' ? 'bg-[#ff0000] text-white shadow-sm' : 'text-slate-600 hover:bg-white'
          }`}
        >
          <User size={15} /> Client Profile
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'subscription' ? 'bg-[#ff0000] text-white shadow-sm' : 'text-slate-600 hover:bg-white'
          }`}
        >
          <CreditCard size={15} /> Subscription History
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'channels' ? 'bg-[#ff0000] text-white shadow-sm' : 'text-slate-600 hover:bg-white'
          }`}
        >
          <PlaySquare size={15} /> Connected Channels ({youtubeChannelsConnected.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'audit' ? 'bg-[#ff0000] text-white shadow-sm' : 'text-slate-600 hover:bg-white'
          }`}
        >
          <History size={15} /> Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-garden-card p-6 rounded-[28px] space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="icon-badge-green !w-10 !h-10">
                  <User size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Profile Details</h3>
              </div>
              <div className="space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Status:</span>
                  <span className="font-bold uppercase text-[#ff0000]">{status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Organization:</span>
                  <span>{organization || 'Personal'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registered On:</span>
                  <span>{new Date(createdAt).toLocaleDateString()}</span>
                </div>
                {lastLoginAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Login:</span>
                    <span>{new Date(lastLoginAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-garden-card p-6 rounded-[28px] space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="icon-badge-green !w-10 !h-10">
                  <CreditCard size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Current Plan</h3>
              </div>
              <div className="space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Plan:</span>
                  <span className="font-bold text-[#ff0000] uppercase">{subscription.plan?.replace('_', ' ') || 'Free'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-[#ff0000] uppercase">{subscription.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Renewal Date:</span>
                  <span>{subscription.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="glass-garden-card p-6 rounded-[28px] space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="icon-badge-green !w-10 !h-10">
                  <Zap size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Automation Usage</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
                <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400">Comments Scanned</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{metrics.commentsScanned || 0}</p>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400">AI Replies Sent</p>
                  <p className="text-lg font-black text-[#ff0000] mt-0.5">{metrics.aiRepliesSent || 0}</p>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400">Toxic Flagged</p>
                  <p className="text-lg font-black text-red-600 mt-0.5">{metrics.toxicComments || 0}</p>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400">Leads Captured</p>
                  <p className="text-lg font-black text-[#ff0000] mt-0.5">{metrics.leadsGenerated || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUBSCRIPTION HISTORY */}
      {activeTab === 'subscription' && (
        <div className="glass-garden-card p-6 rounded-[28px] space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Subscription History Log</h3>
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold">No historical subscription records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-black">
                    <th className="py-2.5">Sub ID</th>
                    <th className="py-2.5">Plan</th>
                    <th className="py-2.5">Amount</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Start Date</th>
                    <th className="py-2.5">Renewal Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(h => (
                    <tr key={h._id}>
                      <td className="py-3 font-mono text-[11px] text-slate-900">{h.subscriptionId || h._id}</td>
                      <td className="py-3 font-bold uppercase text-[#0f0f0f]">{h.plan?.replace('_', ' ')}</td>
                      <td className="py-3 font-bold">₹{h.amount || 0}</td>
                      <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-[#fff1f1] text-[#0f0f0f] text-[10px] font-black">{h.status}</span></td>
                      <td className="py-3 text-slate-500">{new Date(h.startDate || h.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-slate-500">{h.renewalDate ? new Date(h.renewalDate).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CONNECTED CHANNELS */}
      {activeTab === 'channels' && (
        <div className="glass-garden-card p-6 rounded-[28px] space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Connected YouTube Channels</h3>
          {youtubeChannelsConnected.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold">No connected YouTube channels for this account.</p>
          ) : (
            <div className="space-y-3">
              {youtubeChannelsConnected.map((ch, idx) => (
                <div key={idx} className="p-4 bg-white/80 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black">
                      <PlaySquare size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{ch.channelName || ch.title || 'YouTube Channel'}</p>
                      <p className="text-[10px] text-slate-400">Channel ID: {ch.channelId}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    Connected: {new Date(ch.connectedAt || createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="glass-garden-card p-6 rounded-[28px] space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Client Audit Log History</h3>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold">No admin audit log entries recorded for this client.</p>
          ) : (
            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div key={log._id} className="p-3 bg-white/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#fff1f1] text-[#ff0000] flex items-center justify-center font-bold text-[10px]">
                      <Activity size={16} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{log.action}</p>
                      <p className="text-[10px] text-slate-400">By Admin: {log.adminEmail || 'System'}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminClientDetailPage;
