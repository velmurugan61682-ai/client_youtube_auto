import React, { useState, useEffect } from 'react';
import { DollarSign, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/payments');
        if (res.data.success) {
          setPayments(res.data.payments || []);
        }
      } catch (err) {
        console.error('Failed to load payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Payment Audit Logs</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">Complete Razorpay payment transaction history and revenue audit</p>
      </div>

      <div className="glass-garden-card p-0 rounded-[28px] overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-[#ff0000]" size={32} />
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">
            No payment transaction logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Payment ID</th>
                  <th className="py-4 px-4">Client</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-white/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {p.razorpayPaymentId || p._id}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{p.userId?.name || 'Client Account'}</p>
                      <p className="text-[10px] text-slate-400">{p.userId?.email || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-4 font-black text-[#ff0000] text-sm">
                      ₹{p.amount || 345}
                    </td>
                    <td className="py-4 px-4">
                      <span className="yt-badge yt-badge-success">
                        {p.status || 'captured'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-400">
                      {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                    </td>
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

export default AdminPaymentsPage;
