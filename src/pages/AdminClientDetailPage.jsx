import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  PlaySquare, 
  Zap, 
  CreditCard, 
  Loader2,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';

const AdminClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <Loader2 className="animate-spin text-emerald-600" size={32} />
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

  const { profile, channels = [], automation, subscription, paymentHistory = [] } = data;

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/clients')}
          className="p-2 hover:bg-white/80 rounded-xl text-slate-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{profile.name}</h1>
          <p className="text-xs font-semibold text-slate-500">{profile.email} &bull; Client ID: {profile.id}</p>
        </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
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
              <span className="yt-badge yt-badge-success">{profile.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Registered On:</span>
              <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Subscription Summary */}
        <div className="glass-garden-card p-6 rounded-[28px] space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="icon-badge-green !w-10 !h-10">
              <CreditCard size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Subscription Status</h3>
          </div>
          <div className="space-y-2 text-xs font-semibold text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Plan:</span>
              <span className="font-bold text-emerald-600 uppercase">{subscription.currentPlan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="yt-badge yt-badge-success">{subscription.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expiry Date:</span>
              <span>{new Date(subscription.expiryDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Automation Summary */}
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
              <p className="text-lg font-black text-slate-900 mt-0.5">{automation.commentsScanned}</p>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400">AI Replies Sent</p>
              <p className="text-lg font-black text-emerald-600 mt-0.5">{automation.aiRepliesSent}</p>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400">Spam / Toxic Purged</p>
              <p className="text-lg font-black text-red-600 mt-0.5">{automation.deletedComments}</p>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400">Leads Captured</p>
              <p className="text-lg font-black text-teal-600 mt-0.5">{automation.leadsGenerated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connected YouTube Channels */}
      <div className="glass-garden-card p-6 rounded-[28px]">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Connected YouTube Channels</h3>
        {channels.length === 0 ? (
          <p className="text-xs text-slate-400 font-semibold">No connected YouTube channel found for this client.</p>
        ) : (
          <div className="space-y-3">
            {channels.map(ch => (
              <div key={ch._id} className="p-4 bg-white/80 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={ch.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=60'} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{ch.title}</p>
                    <p className="text-[10px] text-slate-400">Channel ID: {ch.channelId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs font-bold text-slate-700">
                  <div>
                    <p className="text-[10px] text-slate-400">Subscribers</p>
                    <p>{ch.statistics?.subscriberCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Videos</p>
                    <p>{ch.statistics?.videoCount || 0}</p>
                  </div>
                  <span className="yt-badge yt-badge-success">OAuth Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History Log */}
      <div className="glass-garden-card p-6 rounded-[28px]">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Payment Transaction History</h3>
        {paymentHistory.length === 0 ? (
          <p className="text-xs text-slate-400 font-semibold">No recorded payment history for this client.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-black">
                  <th className="py-2">Payment ID</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentHistory.map(p => (
                  <tr key={p._id}>
                    <td className="py-2.5 font-bold text-slate-900">{p.razorpayPaymentId || p._id}</td>
                    <td className="py-2.5 text-emerald-600 font-bold">₹{p.amount}</td>
                    <td className="py-2.5"><span className="yt-badge yt-badge-success">{p.status}</span></td>
                    <td className="py-2.5 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClientDetailPage;
