import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import type { OperationalPlan } from '@/types';
import { formatDate } from '@/lib/utils';

const PLAN_TYPES = ['production', 'assembly', 'maintenance', 'delivery', 'quality'];

const emptyForm = {
  plan_title: '', plan_type: 'production', start_date: '', end_date: '',
  status: 'draft', objectives: '', resources_required: '', assigned_team: '', notes: ''
};

export function OperationalPlans() {
  const [plans, setPlans] = useState<OperationalPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editing, setEditing] = useState<OperationalPlan | null>(null);
  const [viewing, setViewing] = useState<OperationalPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchPlans = useCallback(() => {
    fetch('/api/operational-plans').then(r => r.json()).then(setPlans).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  function openCreate() { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); }

  function openEdit(p: OperationalPlan) {
    setEditing(p);
    setForm({ plan_title: p.plan_title, plan_type: p.plan_type, start_date: p.start_date?.split('T')[0] || '', end_date: p.end_date?.split('T')[0] || '', status: p.status, objectives: p.objectives || '', resources_required: p.resources_required || '', assigned_team: p.assigned_team || '', notes: p.notes || '' });
    setErrors({});
    setModalOpen(true);
  }

  function openView(p: OperationalPlan) { setViewing(p); setViewModal(true); }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.plan_title.trim()) e.plan_title = 'Title is required';
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/operational-plans/${editing.id}` : '/api/operational-plans';
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      setModalOpen(false);
      fetchPlans();
    } catch (err) { alert('Error: ' + err); }
    finally { setSaving(false); }
  }

  async function handleDelete(p: OperationalPlan) {
    if (!confirm(`Delete plan "${p.plan_title}"?`)) return;
    await fetch(`/api/operational-plans/${p.id}`, { method: 'DELETE' });
    fetchPlans();
  }

  const columns = [
    { key: 'plan_title', header: 'Plan Title', render: (r: OperationalPlan) => <span className="font-medium">{r.plan_title}</span> },
    { key: 'plan_type', header: 'Type', render: (r: OperationalPlan) => <StatusBadge status={r.plan_type} /> },
    { key: 'start_date', header: 'Start Date', render: (r: OperationalPlan) => formatDate(r.start_date) },
    { key: 'end_date', header: 'End Date', render: (r: OperationalPlan) => formatDate(r.end_date) },
    { key: 'assigned_team', header: 'Team', render: (r: OperationalPlan) => r.assigned_team || '—' },
    { key: 'status', header: 'Status', render: (r: OperationalPlan) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{plans.length} plan{plans.length !== 1 ? 's' : ''}</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New Plan
        </button>
      </div>

      {loading ? <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div> : (
        <DataTable
          data={plans}
          columns={columns}
          searchKeys={['plan_title', 'assigned_team', 'objectives']}
          emptyMessage="No operational plans yet."
          actions={(row) => {
            const p = row as unknown as OperationalPlan;
            return (
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => openView(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Eye size={15} /></button>
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
            );
          }}
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Plan' : 'New Operational Plan'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FormField label="Plan Title" required error={errors.plan_title}>
              <Input value={form.plan_title} onChange={e => setForm(f => ({...f, plan_title: e.target.value}))} error={!!errors.plan_title} placeholder="Q1 Body Truck Assembly Plan" />
            </FormField>
          </div>
          <FormField label="Plan Type">
            <Select value={form.plan_type} onChange={e => setForm(f => ({...f, plan_type: e.target.value}))}>
              {PLAN_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </Select>
          </FormField>
          <FormField label="Start Date">
            <Input type="date" value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} />
          </FormField>
          <FormField label="End Date">
            <Input type="date" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Assigned Team">
              <Input value={form.assigned_team} onChange={e => setForm(f => ({...f, assigned_team: e.target.value}))} placeholder="Welding Team A, Assembly Unit 2" />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Objectives">
              <Textarea value={form.objectives} onChange={e => setForm(f => ({...f, objectives: e.target.value}))} rows={3} placeholder="Produce 20 body trucks, complete chassis welding..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Resources Required">
              <Textarea value={form.resources_required} onChange={e => setForm(f => ({...f, resources_required: e.target.value}))} rows={2} placeholder="Steel plates, welding machines, 5 welders..." />
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
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Plan'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Plan Details" size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Type:</span> <StatusBadge status={viewing.plan_type} /></div>
              <div><span className="text-slate-500">Status:</span> <StatusBadge status={viewing.status} /></div>
              <div><span className="text-slate-500">Start:</span> {formatDate(viewing.start_date)}</div>
              <div><span className="text-slate-500">End:</span> {formatDate(viewing.end_date)}</div>
              <div className="col-span-2"><span className="text-slate-500">Team:</span> {viewing.assigned_team || '—'}</div>
            </div>
            {viewing.objectives && (<div><h4 className="text-sm font-semibold text-slate-700 mb-1">Objectives</h4><p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">{viewing.objectives}</p></div>)}
            {viewing.resources_required && (<div><h4 className="text-sm font-semibold text-slate-700 mb-1">Resources</h4><p className="text-sm text-slate-600 whitespace-pre-wrap">{viewing.resources_required}</p></div>)}
            {viewing.notes && (<div><h4 className="text-sm font-semibold text-slate-700 mb-1">Notes</h4><p className="text-sm text-slate-600 whitespace-pre-wrap">{viewing.notes}</p></div>)}
          </div>
        )}
      </Modal>
    </div>
  );
}
