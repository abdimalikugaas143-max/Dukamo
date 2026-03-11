import { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, XCircle, DollarSign, TrendingUp } from 'lucide-react';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import type { PlatformTransaction } from '@/types';

const PAYMENT_TYPES = ['gig_commission', 'job_posting_fee', 'badge_purchase', 'subscription', 'other'];
const PAYMENT_METHODS_ETH = ['telebirr', 'cbe_birr', 'awash_bank', 'bank_transfer', 'cash'];
const PAYMENT_METHODS_GLOBAL = ['payoneer', 'stripe', 'bank_transfer', 'cash'];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending:   { label: 'Pending',   icon: Clock,        color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', icon: CheckCircle,  color: 'bg-emerald-100 text-emerald-700' },
  failed:    { label: 'Failed',    icon: XCircle,      color: 'bg-red-100 text-red-700' },
};

export function Payments() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PlatformTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'gig_commission', amount: '', currency: 'ETB', payment_method: 'telebirr', notes: '' });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const url = isAdmin ? '/api/payments/all' : '/api/payments/transactions';
    apiGet<PlatformTransaction[]>(url)
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const totalConfirmed = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  async function createTransaction() {
    if (!form.amount || !form.type) return;
    setSaving(true);
    try {
      const tx = await apiPost<PlatformTransaction>('/api/payments/transactions', {
        ...form,
        amount: parseFloat(form.amount),
      });
      setTransactions(t => [tx, ...t]);
      setModalOpen(false);
      setForm({ type: 'gig_commission', amount: '', currency: 'ETB', payment_method: 'telebirr', notes: '' });
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  }

  async function confirmPayment(id: number) {
    try {
      const updated = await apiPatch<PlatformTransaction>(`/api/payments/transactions/${id}/confirm`, {});
      setTransactions(ts => ts.map(t => t.id === id ? updated : t));
    } catch {
      //
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
          <p className="text-slate-500 text-sm mt-1">Track platform transactions and payment references</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={15} className="text-emerald-500" />
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Confirmed</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalConfirmed)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={15} className="text-amber-500" />
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Pending</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={15} className="text-blue-500" />
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Transactions</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{transactions.length}</p>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Transaction History</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <DollarSign size={32} className="mx-auto mb-3 text-slate-300" />
            No transactions yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {isAdmin && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>}
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Method</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Reference</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  {!isAdmin && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => {
                  const sc = STATUS_CONFIG[t.status] || STATUS_CONFIG.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      {isAdmin && <td className="px-5 py-3 text-slate-700">{t.user_name || t.user_id}</td>}
                      <td className="px-5 py-3 text-slate-700 capitalize">{t.type.replace(/_/g, ' ')}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">{t.currency} {t.amount.toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-500 capitalize">{t.payment_method?.replace(/_/g, ' ')}</td>
                      <td className="px-5 py-3 text-slate-400 font-mono text-xs">{t.reference || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${sc.color}`}>
                          <StatusIcon size={11} /> {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(t.created_at)}</td>
                      {!isAdmin && (
                        <td className="px-5 py-3">
                          {t.status === 'pending' && (
                            <button onClick={() => confirmPayment(t.id)}
                              className="text-xs font-semibold text-emerald-600 hover:underline">
                              Confirm
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create transaction modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record a Payment">
        <div className="space-y-4">
          <FormField label="Payment Type">
            <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Amount">
              <Input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
            </FormField>
            <FormField label="Currency">
              <Select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                {['ETB', 'KES', 'UGX', 'TZS', 'USD', 'EUR', 'GBP'].map(c => <option key={c}>{c}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Payment Method">
            <Select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
              {[...PAYMENT_METHODS_ETH, ...PAYMENT_METHODS_GLOBAL].filter((v, i, a) => a.indexOf(v) === i).map(m => (
                <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Notes (Optional)">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes..." rows={2} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={createTransaction} disabled={saving || !form.amount}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {saving ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
