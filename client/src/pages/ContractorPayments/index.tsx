import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import type { ContractorPayment, Contractor, ContractorAgreement } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

const emptyForm = {
  agreement_id: '', contractor_id: '', payment_date: '', amount: '',
  payment_method: 'bank_transfer', reference_number: '', milestone_description: '',
  status: 'pending', notes: '',
};

export function ContractorPayments() {
  const [payments, setPayments] = useState<ContractorPayment[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [agreements, setAgreements] = useState<ContractorAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContractorPayment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchAll = useCallback(() => {
    Promise.all([
      apiGet<ContractorPayment[]>('/api/contractor-payments'),
      apiGet<Contractor[]>('/api/contractors'),
      apiGet<ContractorAgreement[]>('/api/contractor-agreements'),
    ]).then(([p, c, a]) => { setPayments(p); setContractors(c); setAgreements(a); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-fill contractor when agreement selected
  function handleAgreementChange(agreementId: string) {
    const agr = agreements.find(a => String(a.id) === agreementId);
    setForm(f => ({ ...f, agreement_id: agreementId, contractor_id: agr ? String(agr.contractor_id) : f.contractor_id }));
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(p: ContractorPayment) {
    setEditing(p);
    setForm({
      agreement_id: String(p.agreement_id),
      contractor_id: String(p.contractor_id),
      payment_date: p.payment_date?.split('T')[0] || '',
      amount: String(p.amount),
      payment_method: p.payment_method,
      reference_number: p.reference_number || '',
      milestone_description: p.milestone_description || '',
      status: p.status,
      notes: p.notes || '',
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.agreement_id) e.agreement_id = 'Required';
    if (!form.contractor_id) e.contractor_id = 'Required';
    if (!form.amount || isNaN(Number(form.amount))) e.amount = 'Valid amount required';
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = { ...form, agreement_id: Number(form.agreement_id), contractor_id: Number(form.contractor_id), amount: Number(form.amount) };
      if (editing) {
        await apiPut(`/api/contractor-payments/${editing.id}`, payload);
      } else {
        await apiPost('/api/contractor-payments', payload);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      alert('Error: ' + err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: ContractorPayment) {
    if (!confirm('Delete this payment record?')) return;
    await apiDelete(`/api/contractor-payments/${p.id}`);
    fetchAll();
  }

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((s, p) => s + p.amount, 0);

  const columns = [
    { key: 'agreement_number', header: 'Agreement', render: (r: ContractorPayment) => <span className="font-mono text-blue-700">{r.agreement_number}</span> },
    { key: 'contractor_name', header: 'Contractor', render: (r: ContractorPayment) => r.contractor_name || '—' },
    { key: 'milestone_description', header: 'Milestone', render: (r: ContractorPayment) => r.milestone_description || '—' },
    { key: 'amount', header: 'Amount', render: (r: ContractorPayment) => <span className="font-semibold text-slate-800">{formatCurrency(r.amount)}</span> },
    { key: 'payment_method', header: 'Method', render: (r: ContractorPayment) => r.payment_method.replace(/_/g, ' ') },
    { key: 'payment_date', header: 'Date', render: (r: ContractorPayment) => formatDate(r.payment_date) },
    { key: 'status', header: 'Status', render: (r: ContractorPayment) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-600 font-medium uppercase">Total Paid</p>
          <p className="text-xl font-bold text-green-700 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs text-orange-600 font-medium uppercase">Pending</p>
          <p className="text-xl font-bold text-orange-700 mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium uppercase">Overdue</p>
          <p className="text-xl font-bold text-red-700 mt-1">{formatCurrency(totalOverdue)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{payments.length} payment record{payments.length !== 1 ? 's' : ''}</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {loading ? <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div> : (
        <DataTable
          data={payments}
          columns={columns}
          searchKeys={['contractor_name', 'agreement_number', 'reference_number', 'milestone_description']}
          emptyMessage="No payment records yet."
          actions={(row) => {
            const p = row as unknown as ContractorPayment;
            return (
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Edit"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 size={15} /></button>
              </div>
            );
          }}
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Payment' : 'Record Payment'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Agreement" required error={errors.agreement_id}>
            <Select value={form.agreement_id} onChange={e => handleAgreementChange(e.target.value)} error={!!errors.agreement_id}>
              <option value="">Select agreement...</option>
              {agreements.map(a => <option key={a.id} value={a.id}>{a.agreement_number} — {a.title}</option>)}
            </Select>
          </FormField>
          <FormField label="Contractor" required error={errors.contractor_id}>
            <Select value={form.contractor_id} onChange={e => setForm(f => ({...f, contractor_id: e.target.value}))} error={!!errors.contractor_id}>
              <option value="">Select contractor...</option>
              {contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Amount (USD)" required error={errors.amount}>
            <Input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} error={!!errors.amount} placeholder="0.00" />
          </FormField>
          <FormField label="Payment Date">
            <Input type="date" value={form.payment_date} onChange={e => setForm(f => ({...f, payment_date: e.target.value}))} />
          </FormField>
          <FormField label="Payment Method">
            <Select value={form.payment_method} onChange={e => setForm(f => ({...f, payment_method: e.target.value}))}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </Select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Reference Number">
              <Input value={form.reference_number} onChange={e => setForm(f => ({...f, reference_number: e.target.value}))} placeholder="Bank ref or cheque number" />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Milestone / Description">
              <Input value={form.milestone_description} onChange={e => setForm(f => ({...f, milestone_description: e.target.value}))} placeholder="e.g. 30% upfront deposit" />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Notes">
              <Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Record Payment'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
