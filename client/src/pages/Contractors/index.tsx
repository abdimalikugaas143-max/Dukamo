import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import type { Contractor } from '@/types';
import { formatDate } from '@/lib/utils';

const TRADES = ['Welder', 'Fabricator', 'Steel Supplier', 'Assembly Technician', 'Painter', 'Electrician', 'Machinist', 'Subcontractor', 'Other'];

const emptyForm = { name: '', company_name: '', trade: '', phone: '', email: '', address: '', status: 'active', notes: '' };

export function Contractors() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editing, setEditing] = useState<Contractor | null>(null);
  const [viewing, setViewing] = useState<Contractor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchContractors = useCallback(() => {
    fetch('/api/contractors').then(r => r.json()).then(setContractors).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchContractors(); }, [fetchContractors]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(c: Contractor) {
    setEditing(c);
    setForm({ name: c.name, company_name: c.company_name || '', trade: c.trade, phone: c.phone || '', email: c.email || '', address: c.address || '', status: c.status, notes: c.notes || '' });
    setErrors({});
    setModalOpen(true);
  }

  function openView(c: Contractor) {
    setViewing(c);
    setViewModal(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.trade) e.trade = 'Trade is required';
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/contractors/${editing.id}` : '/api/contractors';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      setModalOpen(false);
      fetchContractors();
    } catch (err) {
      alert('Error saving contractor: ' + err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Contractor) {
    if (!confirm(`Delete contractor "${c.name}"? This cannot be undone.`)) return;
    await fetch(`/api/contractors/${c.id}`, { method: 'DELETE' });
    fetchContractors();
  }

  const columns = [
    { key: 'name', header: 'Name', render: (r: Contractor) => <span className="font-medium">{r.name}</span> },
    { key: 'company_name', header: 'Company', render: (r: Contractor) => r.company_name || '—' },
    { key: 'trade', header: 'Trade', render: (r: Contractor) => <StatusBadge status={r.trade.toLowerCase().replace(' ', '_')} /> },
    { key: 'phone', header: 'Phone', render: (r: Contractor) => r.phone || '—' },
    { key: 'email', header: 'Email', render: (r: Contractor) => r.email || '—' },
    { key: 'status', header: 'Status', render: (r: Contractor) => <StatusBadge status={r.status} /> },
    { key: 'created_at', header: 'Added', render: (r: Contractor) => formatDate(r.created_at) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{contractors.length} contractor{contractors.length !== 1 ? 's' : ''} registered</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Contractor
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
      ) : (
        <DataTable
          data={contractors}
          columns={columns}
          searchKeys={['name', 'company_name', 'trade', 'email', 'phone']}
          emptyMessage="No contractors yet. Add your first contractor."
          actions={(row) => {
            const c = row as unknown as Contractor;
            return (
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => openView(c)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="View"><Eye size={15} /></button>
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Edit"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(c)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 size={15} /></button>
              </div>
            );
          }}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Contractor' : 'Add Contractor'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required error={errors.name}>
            <Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} error={!!errors.name} placeholder="John Doe" />
          </FormField>
          <FormField label="Company Name">
            <Input value={form.company_name} onChange={e => setForm(f => ({...f, company_name: e.target.value}))} placeholder="ABC Engineering Ltd." />
          </FormField>
          <FormField label="Trade / Specialization" required error={errors.trade}>
            <Select value={form.trade} onChange={e => setForm(f => ({...f, trade: e.target.value}))} error={!!errors.trade}>
              <option value="">Select trade...</option>
              {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FormField>
          <FormField label="Phone">
            <Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+1 234 567 8901" />
          </FormField>
          <FormField label="Email">
            <Input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="john@example.com" />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Address">
              <Input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="123 Industrial Ave, City" />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Notes">
              <Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} placeholder="Additional notes..." />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Contractor'}
          </button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Contractor Details">
        {viewing && (
          <div className="space-y-3">
            {[
              ['Full Name', viewing.name],
              ['Company', viewing.company_name],
              ['Trade', viewing.trade],
              ['Phone', viewing.phone],
              ['Email', viewing.email],
              ['Address', viewing.address],
              ['Status', viewing.status],
              ['Notes', viewing.notes],
              ['Added', formatDate(viewing.created_at)],
            ].map(([label, value]) => value ? (
              <div key={label as string} className="flex gap-3">
                <span className="text-sm font-medium text-slate-500 w-28 flex-shrink-0">{label}</span>
                <span className="text-sm text-slate-800">{label === 'Status' ? <StatusBadge status={value as string} /> : value}</span>
              </div>
            ) : null)}
          </div>
        )}
      </Modal>
    </div>
  );
}
