import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Textarea } from '@/components/shared/FormField';
import type { MonthlyReport } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

const emptyForm = {
  report_month: '', prepared_by: '', total_units_produced: '0', total_contracts_value: '0',
  active_contractors: '0', production_highlights: '', challenges: '', recommendations: '', financial_summary: ''
};

export function MonthlyReports() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editing, setEditing] = useState<MonthlyReport | null>(null);
  const [viewing, setViewing] = useState<MonthlyReport | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchReports = useCallback(() => {
    fetch('/api/monthly-reports').then(r => r.json()).then(setReports).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  function openCreate() {
    setEditing(null);
    const now = new Date();
    setForm({ ...emptyForm, report_month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(r: MonthlyReport) {
    setEditing(r);
    setForm({
      report_month: r.report_month, prepared_by: r.prepared_by,
      total_units_produced: String(r.total_units_produced), total_contracts_value: String(r.total_contracts_value),
      active_contractors: String(r.active_contractors), production_highlights: r.production_highlights || '',
      challenges: r.challenges || '', recommendations: r.recommendations || '', financial_summary: r.financial_summary || ''
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.report_month) e.report_month = 'Month required';
    if (!form.prepared_by.trim()) e.prepared_by = 'Preparer name required';
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        total_units_produced: Number(form.total_units_produced),
        total_contracts_value: Number(form.total_contracts_value),
        active_contractors: Number(form.active_contractors),
      };
      const url = editing ? `/api/monthly-reports/${editing.id}` : '/api/monthly-reports';
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      setModalOpen(false);
      fetchReports();
    } catch (err) { alert('Error: ' + err); }
    finally { setSaving(false); }
  }

  async function handleDelete(r: MonthlyReport) {
    if (!confirm('Delete this monthly report?')) return;
    await fetch(`/api/monthly-reports/${r.id}`, { method: 'DELETE' });
    fetchReports();
  }

  function formatMonth(m: string) {
    if (!m) return '—';
    const [year, month] = m.split('-');
    const d = new Date(Number(year), Number(month) - 1);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  const columns = [
    { key: 'report_month', header: 'Month', render: (r: MonthlyReport) => <span className="font-medium">{formatMonth(r.report_month)}</span> },
    { key: 'prepared_by', header: 'Prepared By', render: (r: MonthlyReport) => r.prepared_by },
    { key: 'total_units_produced', header: 'Units Produced', render: (r: MonthlyReport) => <span className="font-semibold">{r.total_units_produced}</span> },
    { key: 'total_contracts_value', header: 'Contract Value', render: (r: MonthlyReport) => <span className="font-semibold">{formatCurrency(r.total_contracts_value)}</span> },
    { key: 'active_contractors', header: 'Active Contractors', render: (r: MonthlyReport) => r.active_contractors },
    { key: 'created_at', header: 'Filed', render: (r: MonthlyReport) => formatDate(r.created_at) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{reports.length} report{reports.length !== 1 ? 's' : ''}</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New Monthly Report
        </button>
      </div>

      {loading ? <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div> : (
        <DataTable
          data={reports}
          columns={columns}
          searchKeys={['prepared_by', 'report_month']}
          emptyMessage="No monthly reports yet."
          actions={(row) => {
            const r = row as unknown as MonthlyReport;
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Monthly Report' : 'New Monthly Report'} size="xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Report Month" required error={errors.report_month}>
            <Input type="month" value={form.report_month} onChange={e => setForm(f => ({...f, report_month: e.target.value}))} error={!!errors.report_month} />
          </FormField>
          <FormField label="Prepared By" required error={errors.prepared_by}>
            <Input value={form.prepared_by} onChange={e => setForm(f => ({...f, prepared_by: e.target.value}))} error={!!errors.prepared_by} placeholder="Operations Manager" />
          </FormField>
          <FormField label="Total Units Produced">
            <Input type="number" min="0" value={form.total_units_produced} onChange={e => setForm(f => ({...f, total_units_produced: e.target.value}))} />
          </FormField>
          <FormField label="Total Contracts Value (USD)">
            <Input type="number" min="0" step="0.01" value={form.total_contracts_value} onChange={e => setForm(f => ({...f, total_contracts_value: e.target.value}))} />
          </FormField>
          <FormField label="Active Contractors">
            <Input type="number" min="0" value={form.active_contractors} onChange={e => setForm(f => ({...f, active_contractors: e.target.value}))} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Production Highlights">
              <Textarea value={form.production_highlights} onChange={e => setForm(f => ({...f, production_highlights: e.target.value}))} rows={3} placeholder="Key achievements this month..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Challenges">
              <Textarea value={form.challenges} onChange={e => setForm(f => ({...f, challenges: e.target.value}))} rows={3} placeholder="Issues encountered, delays, etc." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Recommendations">
              <Textarea value={form.recommendations} onChange={e => setForm(f => ({...f, recommendations: e.target.value}))} rows={3} placeholder="Suggestions for improvement..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Financial Summary">
              <Textarea value={form.financial_summary} onChange={e => setForm(f => ({...f, financial_summary: e.target.value}))} rows={3} placeholder="Budget spent, cost breakdown, etc." />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Report'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Monthly Report Details" size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center"><p className="text-xs text-blue-600 font-medium">Units Produced</p><p className="text-2xl font-bold text-blue-700">{viewing.total_units_produced}</p></div>
              <div className="bg-green-50 rounded-lg p-3 text-center"><p className="text-xs text-green-600 font-medium">Contract Value</p><p className="text-xl font-bold text-green-700">{formatCurrency(viewing.total_contracts_value)}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Month:</span> <strong>{formatMonth(viewing.report_month)}</strong></div>
              <div><span className="text-slate-500">Prepared By:</span> {viewing.prepared_by}</div>
              <div><span className="text-slate-500">Active Contractors:</span> {viewing.active_contractors}</div>
              <div><span className="text-slate-500">Filed:</span> {formatDate(viewing.created_at)}</div>
            </div>
            {viewing.production_highlights && <div><h4 className="text-sm font-semibold text-slate-700 mb-1">Production Highlights</h4><p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">{viewing.production_highlights}</p></div>}
            {viewing.challenges && <div><h4 className="text-sm font-semibold text-slate-700 mb-1">Challenges</h4><p className="text-sm text-slate-600 whitespace-pre-wrap">{viewing.challenges}</p></div>}
            {viewing.recommendations && <div><h4 className="text-sm font-semibold text-slate-700 mb-1">Recommendations</h4><p className="text-sm text-slate-600 whitespace-pre-wrap">{viewing.recommendations}</p></div>}
            {viewing.financial_summary && <div><h4 className="text-sm font-semibold text-slate-700 mb-1">Financial Summary</h4><p className="text-sm text-slate-600 whitespace-pre-wrap">{viewing.financial_summary}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
