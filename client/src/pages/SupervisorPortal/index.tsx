import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, ClipboardList, Plus, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import type { DailyReport, OperationalPlan } from '@/types';
import { formatDate } from '@/lib/utils';

const emptyForm = {
  report_date: new Date().toISOString().split('T')[0],
  shift: 'day',
  production_summary: '',
  units_produced: '0',
  quality_issues: '',
  safety_incidents: '',
  equipment_status: '',
  weather_conditions: '',
  attendance_count: '0',
  notes: '',
  operational_plan_id: '',
};

function ReviewBadge({ status }: { status: string }) {
  if (status === 'approved') return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <CheckCircle2 size={11} /> Approved
    </span>
  );
  if (status === 'rejected') return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      <XCircle size={11} /> Rejected
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <Clock size={11} /> Pending Review
    </span>
  );
}

export function SupervisorPortal() {
  const { supervisorName } = useRole();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [plans, setPlans] = useState<OperationalPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAll = useCallback(() => {
    Promise.all([
      fetch(`/api/daily-reports?supervisor_name=${encodeURIComponent(supervisorName)}`).then(r => r.json()),
      fetch('/api/operational-plans?status=active').then(r => r.json()),
    ]).then(([rep, pl]) => { setReports(rep); setPlans(pl); }).finally(() => setLoading(false));
  }, [supervisorName]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function openSubmit() {
    setForm({ ...emptyForm, report_date: new Date().toISOString().split('T')[0] });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.report_date) e.report_date = 'Date required';
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        supervisor_name: supervisorName,
        units_produced: Number(form.units_produced),
        attendance_count: Number(form.attendance_count),
        operational_plan_id: form.operational_plan_id ? Number(form.operational_plan_id) : null,
      };
      const res = await fetch('/api/daily-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setModalOpen(false);
      setSuccessMsg('Report submitted successfully. Awaiting manager review.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchAll();
    } catch (err) { alert('Error: ' + err); }
    finally { setSaving(false); }
  }

  const totalUnits = reports.reduce((s, r) => s + (r.units_produced || 0), 0);
  const approvedCount = reports.filter(r => (r as any).review_status === 'approved').length;
  const pendingCount = reports.filter(r => (r as any).review_status === 'submitted').length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl font-bold">{supervisorName}</h1>
            <p className="text-slate-400 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button
            onClick={openSubmit}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-600/30"
          >
            <Plus size={16} /> Submit Daily Report
          </button>
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <ClipboardList size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{reports.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Reports</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalUnits.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">Units Produced</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{approvedCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Approved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Reports */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">My Reports</h2>
            {pendingCount > 0 && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                {pendingCount} awaiting review
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardList size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No reports yet. Submit your first daily report.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {reports.slice(0, 10).map(r => {
                const reviewStatus = (r as any).review_status || 'submitted';
                const reviewNotes = (r as any).review_notes;
                return (
                  <li key={r.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800">{formatDate(r.report_date)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.shift === 'day' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {r.shift} shift
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{r.units_produced} units &bull; {r.attendance_count} staff</p>
                        {reviewStatus === 'rejected' && reviewNotes && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
                            <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                            <span><strong>Manager note:</strong> {reviewNotes}</span>
                          </div>
                        )}
                      </div>
                      <ReviewBadge status={reviewStatus} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Active Plans */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Active Plans</h2>
          </div>
          {plans.length === 0 ? (
            <div className="py-10 text-center">
              <Users size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No active plans</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {plans.map(p => (
                <li key={p.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-slate-700">{p.plan_title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{p.plan_type} plan</p>
                  {p.assigned_team && <p className="text-xs text-slate-400 mt-0.5">Team: {p.assigned_team}</p>}
                  {p.end_date && <p className="text-xs text-slate-400">Ends: {formatDate(p.end_date)}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Submit Report Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Daily Report" size="xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 mb-4 text-sm text-blue-800">
          Submitting as <strong>{supervisorName}</strong>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Report Date" required error={errors.report_date}>
            <Input type="date" value={form.report_date} onChange={e => setForm(f => ({ ...f, report_date: e.target.value }))} error={!!errors.report_date} />
          </FormField>
          <FormField label="Shift">
            <Select value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}>
              <option value="day">Day Shift</option>
              <option value="night">Night Shift</option>
            </Select>
          </FormField>
          <FormField label="Linked Operational Plan">
            <Select value={form.operational_plan_id} onChange={e => setForm(f => ({ ...f, operational_plan_id: e.target.value }))}>
              <option value="">None</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.plan_title}</option>)}
            </Select>
          </FormField>
          <FormField label="Units Produced">
            <Input type="number" min="0" value={form.units_produced} onChange={e => setForm(f => ({ ...f, units_produced: e.target.value }))} />
          </FormField>
          <FormField label="Attendance Count">
            <Input type="number" min="0" value={form.attendance_count} onChange={e => setForm(f => ({ ...f, attendance_count: e.target.value }))} />
          </FormField>
          <FormField label="Equipment Status">
            <Input value={form.equipment_status} onChange={e => setForm(f => ({ ...f, equipment_status: e.target.value }))} placeholder="All operational / Issues..." />
          </FormField>
          <FormField label="Weather Conditions">
            <Input value={form.weather_conditions} onChange={e => setForm(f => ({ ...f, weather_conditions: e.target.value }))} placeholder="Clear / Rainy / Hot" />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Production Summary">
              <Textarea value={form.production_summary} onChange={e => setForm(f => ({ ...f, production_summary: e.target.value }))} rows={3} placeholder="Describe what was produced or worked on today..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Quality Issues">
              <Textarea value={form.quality_issues} onChange={e => setForm(f => ({ ...f, quality_issues: e.target.value }))} rows={2} placeholder="None / Describe any quality issues..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Safety Incidents">
              <Textarea value={form.safety_incidents} onChange={e => setForm(f => ({ ...f, safety_incidents: e.target.value }))} rows={2} placeholder="None / Describe any incidents..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Additional Notes">
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
