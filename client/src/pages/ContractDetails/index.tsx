import { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Textarea, Select } from '@/components/shared/FormField';
import type { ContractDetail, ContractorAgreement } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ContractDetailWithAgreement extends ContractDetail {
  agreement_number?: string;
  agreement_title?: string;
}

const emptyForm = { agreement_id: '', item_description: '', unit: '', quantity: '1', unit_price: '0', notes: '' };

export function ContractDetails() {
  const [details, setDetails] = useState<ContractDetailWithAgreement[]>([]);
  const [agreements, setAgreements] = useState<ContractorAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContractDetailWithAgreement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    const agrs: ContractorAgreement[] = await fetch('/api/contractor-agreements').then(r => r.json());
    setAgreements(agrs);

    // Fetch all details for all agreements
    const allDetails: ContractDetailWithAgreement[] = [];
    for (const agr of agrs) {
      const items: ContractDetail[] = await fetch(`/api/contract-details/agreement/${agr.id}`).then(r => r.json());
      items.forEach(item => allDetails.push({ ...item, agreement_number: agr.agreement_number, agreement_title: agr.title }));
    }
    setDetails(allDetails);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function openEdit(d: ContractDetailWithAgreement) {
    setEditing(d);
    setForm({ agreement_id: String(d.agreement_id), item_description: d.item_description, unit: d.unit || '', quantity: String(d.quantity), unit_price: String(d.unit_price), notes: d.notes || '' });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await fetch(`/api/contract-details/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity), unit_price: Number(form.unit_price) }),
      });
      setModalOpen(false);
      fetchAll();
    } catch (err) { alert('Error: ' + err); }
    finally { setSaving(false); }
  }

  async function handleDelete(d: ContractDetailWithAgreement) {
    if (!confirm('Delete this line item?')) return;
    await fetch(`/api/contract-details/${d.id}`, { method: 'DELETE' });
    fetchAll();
  }

  const columns = [
    { key: 'agreement_number', header: 'Agreement', render: (r: ContractDetailWithAgreement) => <span className="font-mono text-blue-700 text-xs">{r.agreement_number}</span> },
    { key: 'item_description', header: 'Description', render: (r: ContractDetailWithAgreement) => <span className="font-medium">{r.item_description}</span> },
    { key: 'unit', header: 'Unit', render: (r: ContractDetailWithAgreement) => r.unit || '—' },
    { key: 'quantity', header: 'Qty', render: (r: ContractDetailWithAgreement) => r.quantity },
    { key: 'unit_price', header: 'Unit Price', render: (r: ContractDetailWithAgreement) => formatCurrency(r.unit_price) },
    { key: 'total_price', header: 'Total', render: (r: ContractDetailWithAgreement) => <span className="font-semibold">{formatCurrency(r.total_price)}</span> },
  ];

  const grandTotal = details.reduce((s, d) => s + d.total_price, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{details.length} line item{details.length !== 1 ? 's' : ''} &bull; Grand total: <strong>{formatCurrency(grandTotal)}</strong></p>
        <p className="text-xs text-slate-400">Add items from the Agreements page</p>
      </div>

      {loading ? <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div> : (
        <DataTable
          data={details}
          columns={columns}
          searchKeys={['item_description', 'agreement_number', 'agreement_title']}
          emptyMessage="No contract line items. Add items from Contractor Agreements."
          actions={(row) => {
            const d = row as unknown as ContractDetailWithAgreement;
            return (
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(d)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
            );
          }}
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit Line Item">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Agreement">
            <Select value={form.agreement_id} disabled>
              {agreements.map(a => <option key={a.id} value={a.id}>{a.agreement_number}</option>)}
            </Select>
          </FormField>
          <FormField label="Unit">
            <Input value={form.unit} onChange={e => setForm(f => ({...f, unit: e.target.value}))} placeholder="pcs / hrs / kg" />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Description">
              <Input value={form.item_description} onChange={e => setForm(f => ({...f, item_description: e.target.value}))} />
            </FormField>
          </div>
          <FormField label="Quantity">
            <Input type="number" min="0" step="0.01" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} />
          </FormField>
          <FormField label="Unit Price">
            <Input type="number" min="0" step="0.01" value={form.unit_price} onChange={e => setForm(f => ({...f, unit_price: e.target.value}))} />
          </FormField>
          <div className="sm:col-span-2">
            <div className="bg-blue-50 rounded-lg p-3 text-sm">
              <span className="text-slate-600">Total: </span>
              <strong className="text-blue-700">{formatCurrency(Number(form.quantity) * Number(form.unit_price))}</strong>
            </div>
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
