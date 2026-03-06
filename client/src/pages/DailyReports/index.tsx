import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import type { DailyReport, OperationalPlan } from '@/types';
import { formatDate } from '@/lib/utils';

const emptyForm = {
  report_date: '', shift: 'day', supervisor_name: '', production_summary: '',
  units_produced: '0', quality_issues: '', safety_incidents: '', equipment_status: '',
  weather_conditions: '', attendance_count: '0', notes: '', operational_plan_id: ''
};

export function DailyReports() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [plans, setPlans] = useState<OperationalPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editing, setEditing] = useState<DailyReport | null>(null);
  const [viewing, setViewing] = useState<DailyReport | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchAll = useCallback(() => {
    Promise.all([
      fetch('/api/daily-reports').then(r => r.json()),
      fetch('/api/operational-plans').then(r => r.json()),
    ]).then(([rep, pl]) => { setReports(rep); setPlans(pl); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, report_date: new Date().toISOString().split('T')[0] });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(r: DailyReport) {
    setEditing(r);
    setForm({
      report_date: r.report_date, shift: r.shift, supervisor_name: r.supervisor_name,
      production_summary: r.production_summary || '', units_produced: String(r.units_produced),
      quality_issues: r.quality_issues || '', safety_incidents: r.safety_incidents || '',
      equipment_status: r.equipment_status || '', weather_conditions: r.weather_conditions || '',
      attendance_count: String(r.attendance_count), notes: r.notes || '',
      operational_plan_id: r.operational_plan_id ? String(r.operational_plan_id) : ''
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.report_date) e.report_date = 'Date required';
    if (!form.supervisor_name.trim()) e.supervisor_name = 'Supervisor name required';
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = { ...form, units_produced: Number(form.units_produced), attendance_count: Number(form.attendance_count), operational_plan_id: form.operational_plan_id ? Number(form.operational_plan_id) : null };
      const url = editing ? `/api/daily-reports/${editing.id}` : '/api/daily-reports';
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await res.text());
      setModalOpen(false);
      fetchAll();
    } catch (err) { alert('Error: ' + err); }
    finally { setSaving(false); }
  }

  async function handleDelete(r: DailyReport) {
    if (!confirm('Delete this report?')) return;
    await fetch(`/api/daily-reports/${r.id}`, { method: 'DELETE' });
    fetchAll();
  }

  const columns = [
    { key: 'report_date', header: 'Date', render: (r: DailyReport) => <span className="font-medium">{formatDate(r.report_date)}</span> },
    { key: 'shift', header: 'Shift', render: (r: DailyReport) => <StatusBadge status={r.shift} /> },
    { key: 'supervisor_name', header: 'Supervisor', render: (r: DailyReport) => r.supervisor_name },
    { key: 'units_produced', header: 'Units Produced', render: (r: DailyReport) => <span className="font-semibold">{r.units_produced}</span> },
    { key: 'attendance_count', header: 'Attendance', render: (r: DailyReport) => r.attendance_count },
    { key: 'plan_title', header: 'Plan', render: (r: DailyReport) => r.plan_title || '—' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{reports.length} report{reports.length !== 1 ? 's' : ''}</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New Report
        </button>
      </div>

      {loading ? <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div> : (
        <DataTable
          data={reports}
          columns={columns}
          searchKeys={['supervisor_name', 'report_date', 'plan_title']}
          emptyMessage="No daily reports yet."
          actions={(row) => {
            const r = row as unknown as DailyReport;
            return (
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => { setViewing(r); setViewModal(true); }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Eye size={15} /></button>
                <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(r)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
            );
          }}
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Daily Report' : 'New Daily Report'} size="xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Report Date" required error={errors.report_date}>
            <Input type="date" value={form.report_date} onChange={e => setForm(f => ({...f, report_date: e.target.value}))} error={!!errors.report_date} />
          </FormField>
          <FormField label="Shift">
            <Select value={form.shift} onChange={e => setForm(f => ({...f, shift: e.target.value}))}>
              <option value="day">Day Shift</option>
              <option value="night">Night Shift</option>
            </Select>
          </FormField>
          <FormField label="Supervisor Name" required error={errors.supervisor_name}>
            <Input value={form.supervisor_name} onChange={e => setForm(f => ({...f, supervisor_name: e.target.value}))} error={!!errors.supervisor_name} placeholder="John Mwangi" />
          </FormField>
          <FormField label="Linked Operational Plan">
            <Select value={form.operational_plan_id} onChange={e => setForm(f => ({...f, operational_plan_id: e.target.value}))}>
              <option value="">None</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.plan_title}</option>)}
            </Select>
          </FormField>
          <FormField label="Units Produced">
            <Input type="number" min="0" value={form.units_produced} onChange={e => setForm(f => ({...f, units_produced: e.target.value}))} />
          </FormField>
          <FormField label="Attendance Count">
            <Input type="number" min="0" value={form.attendance_count} onChange={e => setForm(f => ({...f, attendance_count: e.target.value}))} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Production Summary">
              <Textarea value={form.production_summary} onChange={e => setForm(f => ({...f, production_summary: e.target.value}))} rows={3} placeholder="Describe what was produced or worked on today..." />
            </FormField>
          </div>
          <FormField label="Equipment Status">
            <Input value={form.equipment_status} onChange={e => setForm(f => ({...f, equipment_status: e.target.value}))} placeholder="All operational / Welder #3 down for maintenance" />
          </FormField>
          <FormField label="Weather Conditions">
            <Input value={form.weather_conditions} onChange={e => setForm(f => ({...f, weather_conditions: e.target.value}))} placeholder="Clear / Rainy / Hot" />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Quality Issues">
              <Textarea value={form.quality_issues} onChange={e => setForm(f => ({...f, quality_issues: e.target.value}))} rows={2} placeholder="Any quality issues observed..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Safety Incidents">
              <Textarea value={form.safety_incidents} onChange={e => setForm(f => ({...f, safety_incidents: e.target.value}))} rows={2} placeholder="None / Describe any safety incidents..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Additional Notes">
              <Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Submit Report'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Daily Report Details" size="lg">
        {viewing && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Date:</span> <strong>{formatDate(viewing.report_date)}</strong></div>
              <div><span className="text-slate-500">Shift:</span> <StatusBadge status={viewing.shift} /></div>
              <div><span className="text-slate-500">Supervisor:</span> {viewing.supervisor_name}</div>
              <div><span className="text-slate-500">Units Produced:</span> <strong>{viewing.units_produced}</strong></div>
              <div><span className="text-slate-500">Attendance:</span> {viewing.attendance_count}</div>
              <div><span className="text-slate-500">Equipment:</span> {viewing.equipment_status || '—'}</div>
              <div><span className="text-slate-500">Weather:</span> {viewing.weather_conditions || '—'}</div>
              <div><span className="text-slate-500">Plan:</span> {viewing.plan_title || '—'}</div>
            </div>
            {viewing.production_summary && <div><h4 className="text-sm font-semibold text-slate-700 mb-1">Production Summary</h4><p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">{viewing.production_summary}</p></div>}
            {viewing.quality_issues && <div><h4 className="text-sm font-semibold text-slate-700 mb-1">Quality Issues</h4><p className="text-sm text-slate-600 whitespace-pre-wrap">{viewing.quality_issues}</p></div>}
            {viewing.safety_incidents && <div><h4 className="text-sm font-semibold text-slate-700 mb-1">Safety Incidents</h4><p className="text-sm text-slate-600 whitespace-pre-wrap">{viewing.safety_incidents}</p></div>}
            {viewing.notes && <div><h4 className="text-sm font-semibold text-slate-700 mb-1">Notes</h4><p className="text-sm text-slate-600 whitespace-pre-wrap">{viewing.notes}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
