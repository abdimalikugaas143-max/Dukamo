import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, Eye, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import { ContractPrintView } from '@/components/print/ContractPrintView';
import type { ContractorAgreement, Contractor } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { apiGet, apiPost, apiPut, apiDelete, apiFetch } from '@/lib/api';

const STATUSES = ['draft', 'active', 'completed', 'terminated'];

const emptyForm = {
  contractor_id: '', agreement_number: '', title: '', scope_of_work: '',
  start_date: '', end_date: '', contract_value: '', currency: 'USD',
  payment_terms: '', status: 'draft', special_conditions: ''
};

export function ContractorAgreements() {
  const [agreements, setAgreements] = useState<ContractorAgreement[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [editing, setEditing] = useState<ContractorAgreement | null>(null);
  const [selected, setSelected] = useState<ContractorAgreement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Line items state
  const [newItem, setNewItem] = useState({ item_description: '', unit: '', quantity: '1', unit_price: '0', notes: '' });
  const [addingItem, setAddingItem] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const fetchAll = useCallback(() => {
    Promise.all([
      apiGet<ContractorAgreement[]>('/api/contractor-agreements'),
      apiGet<Contractor[]>('/api/contractors'),
    ]).then(([a, c]) => {
      setAgreements(a);
      setContractors(c);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function openDetail(a: ContractorAgreement) {
    const full = await apiGet<ContractorAgreement>(`/api/contractor-agreements/${a.id}`);
    setSelected(full);
    setDetailModal(true);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(a: ContractorAgreement) {
    setEditing(a);
    setForm({
      contractor_id: String(a.contractor_id),
      agreement_number: a.agreement_number,
      title: a.title,
      scope_of_work: a.scope_of_work || '',
      start_date: a.start_date?.split('T')[0] || '',
      end_date: a.end_date?.split('T')[0] || '',
      contract_value: String(a.contract_value),
      currency: a.currency,
      payment_terms: a.payment_terms || '',
      status: a.status,
      special_conditions: a.special_conditions || '',
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.contractor_id) e.contractor_id = 'Required';
    if (!form.agreement_number.trim()) e.agreement_number = 'Required';
    if (!form.title.trim()) e.title = 'Required';
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = { ...form, contractor_id: Number(form.contractor_id), contract_value: Number(form.contract_value) || 0 };
      if (editing) {
        await apiPut(`/api/contractor-agreements/${editing.id}`, payload);
      } else {
        await apiPost('/api/contractor-agreements', payload);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      alert('Error: ' + err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a: ContractorAgreement) {
    if (!confirm(`Delete agreement "${a.agreement_number}"?`)) return;
    await apiDelete(`/api/contractor-agreements/${a.id}`);
    fetchAll();
  }

  async function handleAddItem() {
    if (!selected || !newItem.item_description) return;
    setAddingItem(true);
    await apiPost('/api/contract-details', { ...newItem, agreement_id: selected.id, quantity: Number(newItem.quantity), unit_price: Number(newItem.unit_price) });
    const full = await apiGet<ContractorAgreement>(`/api/contractor-agreements/${selected.id}`);
    setSelected(full);
    setNewItem({ item_description: '', unit: '', quantity: '1', unit_price: '0', notes: '' });
    setAddingItem(false);
  }

  async function handleDeleteItem(itemId: number) {
    if (!selected) return;
    await apiDelete(`/api/contract-details/${itemId}`);
    const full = await apiGet<ContractorAgreement>(`/api/contractor-agreements/${selected.id}`);
    setSelected(full);
  }

  const columns = [
    { key: 'agreement_number', header: 'Agreement #', render: (r: ContractorAgreement) => <span className="font-mono font-medium text-blue-700">{r.agreement_number}</span> },
    { key: 'title', header: 'Title', render: (r: ContractorAgreement) => <span className="font-medium">{r.title}</span> },
    { key: 'contractor_name', header: 'Contractor', render: (r: ContractorAgreement) => r.contractor_name || '—' },
    { key: 'contract_value', header: 'Value', render: (r: ContractorAgreement) => <span className="font-semibold">{formatCurrency(r.contract_value, r.currency)}</span> },
    { key: 'start_date', header: 'Start', render: (r: ContractorAgreement) => formatDate(r.start_date) },
    { key: 'end_date', header: 'End', render: (r: ContractorAgreement) => formatDate(r.end_date) },
    { key: 'status', header: 'Status', render: (r: ContractorAgreement) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{agreements.length} agreement{agreements.length !== 1 ? 's' : ''}</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New Agreement
        </button>
      </div>

      {loading ? <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div> : (
        <DataTable
          data={agreements}
          columns={columns}
          searchKeys={['agreement_number', 'title', 'contractor_name']}
          emptyMessage="No agreements yet."
          actions={(row) => {
            const a = row as unknown as ContractorAgreement;
            return (
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => openDetail(a)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="View"><Eye size={15} /></button>
                <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Edit"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(a)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 size={15} /></button>
              </div>
            );
          }}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Agreement' : 'New Agreement'} size="xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Contractor" required error={errors.contractor_id}>
            <Select value={form.contractor_id} onChange={e => setForm(f => ({...f, contractor_id: e.target.value}))} error={!!errors.contractor_id}>
              <option value="">Select contractor...</option>
              {contractors.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.id}>{c.name}{c.company_name ? ` — ${c.company_name}` : ''}</option>)}
            </Select>
          </FormField>
          <FormField label="Agreement Number" required error={errors.agreement_number}>
            <Input value={form.agreement_number} onChange={e => setForm(f => ({...f, agreement_number: e.target.value}))} error={!!errors.agreement_number} placeholder="CA-2024-001" />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Title" required error={errors.title}>
              <Input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} error={!!errors.title} placeholder="Welding Services for 10x Body Trucks" />
            </FormField>
          </div>
          <FormField label="Start Date">
            <Input type="date" value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} />
          </FormField>
          <FormField label="End Date">
            <Input type="date" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} />
          </FormField>
          <FormField label="Contract Value">
            <Input type="number" min="0" step="0.01" value={form.contract_value} onChange={e => setForm(f => ({...f, contract_value: e.target.value}))} placeholder="0.00" />
          </FormField>
          <FormField label="Currency">
            <Select value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="ZAR">ZAR</option>
            </Select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Status">
              <Select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Scope of Work">
              <Textarea value={form.scope_of_work} onChange={e => setForm(f => ({...f, scope_of_work: e.target.value}))} rows={4} placeholder="Describe the work to be performed..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Payment Terms">
              <Textarea value={form.payment_terms} onChange={e => setForm(f => ({...f, payment_terms: e.target.value}))} rows={2} placeholder="e.g. 30% upfront, 70% upon completion" />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Special Conditions">
              <Textarea value={form.special_conditions} onChange={e => setForm(f => ({...f, special_conditions: e.target.value}))} rows={2} placeholder="Any special terms or conditions..." />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Agreement'}
          </button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title={`Agreement: ${selected?.agreement_number}`} size="xl">
        {selected && (
          <div className="space-y-5">
            {/* Print button */}
            <div className="flex justify-end">
              <button
                onClick={() => handlePrint()}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors no-print"
              >
                <Printer size={16} /> Print / Save PDF
              </button>
            </div>

            {/* Hidden print view */}
            <div className="hidden">
              <div ref={printRef}>
                <ContractPrintView agreement={selected} />
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Contractor:</span> <strong>{selected.contractor_name}</strong></div>
              <div><span className="text-slate-500">Status:</span> <StatusBadge status={selected.status} /></div>
              <div><span className="text-slate-500">Start:</span> {formatDate(selected.start_date)}</div>
              <div><span className="text-slate-500">End:</span> {formatDate(selected.end_date)}</div>
              <div><span className="text-slate-500">Value:</span> <strong className="text-green-700">{formatCurrency(selected.contract_value, selected.currency)}</strong></div>
              <div><span className="text-slate-500">Currency:</span> {selected.currency}</div>
            </div>

            {selected.scope_of_work && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Scope of Work</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border">{selected.scope_of_work}</p>
              </div>
            )}

            {/* Line items */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Contract Items / Deliverables</h4>
              {selected.details && selected.details.length > 0 ? (
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden mb-3">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-center">Unit</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selected.details.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2">{d.item_description}</td>
                        <td className="px-3 py-2 text-center">{d.unit || '—'}</td>
                        <td className="px-3 py-2 text-right">{d.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(d.unit_price, selected.currency)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{formatCurrency(d.total_price, selected.currency)}</td>
                        <td className="px-3 py-2 text-right">
                          <button onClick={() => handleDeleteItem(d.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-semibold">
                      <td colSpan={4} className="px-3 py-2 text-right">Total</td>
                      <td className="px-3 py-2 text-right text-green-700">
                        {formatCurrency(selected.details.reduce((s, d) => s + d.total_price, 0), selected.currency)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              ) : <p className="text-xs text-slate-400 mb-3">No items added yet.</p>}

              {/* Add item form */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs font-medium text-slate-600 mb-2">Add Item</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <input className="sm:col-span-2 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Description*" value={newItem.item_description} onChange={e => setNewItem(i => ({...i, item_description: e.target.value}))} />
                  <input className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Unit (pcs/hrs)" value={newItem.unit} onChange={e => setNewItem(i => ({...i, unit: e.target.value}))} />
                  <input type="number" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Qty" value={newItem.quantity} onChange={e => setNewItem(i => ({...i, quantity: e.target.value}))} />
                  <input type="number" className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Unit Price" value={newItem.unit_price} onChange={e => setNewItem(i => ({...i, unit_price: e.target.value}))} />
                </div>
                <button onClick={handleAddItem} disabled={addingItem || !newItem.item_description} className="mt-2 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
                  {addingItem ? 'Adding...' : '+ Add Item'}
                </button>
              </div>
            </div>

            {selected.payment_terms && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Payment Terms</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{selected.payment_terms}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
