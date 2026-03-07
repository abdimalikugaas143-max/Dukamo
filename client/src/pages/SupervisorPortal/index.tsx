import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, FolderKanban, Plus, Truck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import { apiGet, apiPost } from '@/lib/api';
import type { DailyReport } from '@/types';
import type { Project } from '@/pages/Projects';
import { formatDate } from '@/lib/utils';

const VEHICLE_TYPES = ['Body truck', 'Trailer', 'Body tank', 'Trailer tank', 'Long truck', 'Underground tank', 'Maintenance', 'Accessories'];

const emptyForm = {
  report_date: new Date().toISOString().split('T')[0],
  shift: 'day', project_id: '', vehicle_code: '', vehicle_type: '',
  production_summary: '', quality_issues: '', safety_incidents: '',
  equipment_status: '', weather_conditions: '', notes: ''
};

function ReviewBadge({ status }: { status: string }) {
  if (status === 'approved') return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><CheckCircle2 size={11} /> Approved</span>;
  if (status === 'rejected') return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full"><XCircle size={11} /> Rejected</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><Clock size={11} /> Pending Review</span>;
}

export function SupervisorPortal() {
  const { user } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAll = useCallback(() => {
    Promise.all([
      apiGet<DailyReport[]>(`/api/daily-reports?supervisor_name=${encodeURIComponent(user?.name || '')}`),
      apiGet<Project[]>('/api/projects'),
    ]).then(([rep, pl]) => { setReports(rep); setProjects(pl); }).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function openSubmit() {
    setForm({ ...emptyForm, report_date: new Date().toISOString().split('T')[0] });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.report_date) { setErrors({ report_date: 'Date required' }); return; }
    setSaving(true);
    try {
      await apiPost('/api/daily-reports', {
        ...form,
        supervisor_name: user?.name,
        project_id: form.project_id ? Number(form.project_id) : null,
      });
      setModalOpen(false);
      setSuccessMsg('Report submitted! Awaiting manager review.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchAll();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  }

  const approvedCount = reports.filter(r => r.review_status === 'approved').length;
  const pendingCount = reports.filter(r => r.review_status === 'submitted').length;
  const ongoingProjects = projects.filter(p => p.status === 'ongoing');

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-slate-400 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button onClick={openSubmit} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-600/30">
            <Plus size={16} /> Submit Daily Report
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm">
          <CheckCircle2 size={16} className="flex-shrink-0" /> {successMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reports', value: reports.length, icon: FolderKanban, bg: 'bg-blue-100', color: 'text-blue-600' },
          { label: 'Approved', value: approvedCount, icon: CheckCircle2, bg: 'bg-emerald-100', color: 'text-emerald-600' },
          { label: 'Pending', value: pendingCount, icon: Clock, bg: 'bg-amber-100', color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Reports */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">My Reports</h2>
            {pendingCount > 0 && <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">{pendingCount} awaiting review</span>}
          </div>
          {loading ? <div className="flex items-center justify-center h-48"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
            : reports.length === 0 ? (
              <div className="py-12 text-center"><Truck size={32} className="text-slate-300 mx-auto mb-3" /><p className="text-slate-500 text-sm">No reports yet. Submit your first daily report.</p></div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {reports.slice(0, 10).map(r => (
                  <li key={r.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800">{formatDate(r.report_date)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.shift === 'day' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>{r.shift} shift</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {(r as any).vehicle_code ? <span className="font-mono font-bold mr-1">{(r as any).vehicle_code}</span> : ''}
                          {(r as any).vehicle_type || '—'}
                          {(r as any).project_title ? ` · ${(r as any).project_title}` : ''}
                        </p>
                        {r.review_status === 'rejected' && r.review_notes && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
                            <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                            <span><strong>Manager note:</strong> {r.review_notes}</span>
                          </div>
                        )}
                      </div>
                      <ReviewBadge status={r.review_status || 'submitted'} />
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </div>

        {/* Ongoing Projects */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Ongoing Projects</h2>
          </div>
          {ongoingProjects.length === 0 ? (
            <div className="py-10 text-center"><FolderKanban size={28} className="text-slate-300 mx-auto mb-2" /><p className="text-slate-500 text-sm">No ongoing projects</p></div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {ongoingProjects.map(p => (
                <li key={p.id} className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{p.project_code}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">{p.title}</p>
                  {p.vehicle_type && <p className="text-xs text-slate-400 mt-0.5">{p.vehicle_type}</p>}
                  {p.end_date && <p className="text-xs text-slate-400">Due: {formatDate(p.end_date)}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Submit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Daily Report" size="xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 mb-4 text-sm text-blue-800">
          Submitting as <strong>{user?.name}</strong>
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
          <FormField label="Project">
            <Select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}>
              <option value="">Select project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>[{p.status.toUpperCase()}] {p.project_code} — {p.title}</option>)}
            </Select>
          </FormField>
          <FormField label="Vehicle Code">
            <Input value={form.vehicle_code} onChange={e => setForm(f => ({ ...f, vehicle_code: e.target.value.toUpperCase() }))} placeholder="VH-001" />
          </FormField>
          <FormField label="Vehicle Type">
            <Select value={form.vehicle_type} onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))}>
              <option value="">Select vehicle type...</option>
              {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
            </Select>
          </FormField>
          <FormField label="Equipment Status">
            <Input value={form.equipment_status} onChange={e => setForm(f => ({ ...f, equipment_status: e.target.value }))} placeholder="All operational..." />
          </FormField>
          <FormField label="Weather">
            <Input value={form.weather_conditions} onChange={e => setForm(f => ({ ...f, weather_conditions: e.target.value }))} placeholder="Clear / Rainy / Hot" />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Production Summary">
              <Textarea value={form.production_summary} onChange={e => setForm(f => ({ ...f, production_summary: e.target.value }))} rows={3} placeholder="Work done today..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Quality Issues">
              <Textarea value={form.quality_issues} onChange={e => setForm(f => ({ ...f, quality_issues: e.target.value }))} rows={2} placeholder="None / describe..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Safety Incidents">
              <Textarea value={form.safety_incidents} onChange={e => setForm(f => ({ ...f, safety_incidents: e.target.value }))} rows={2} placeholder="None / describe..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Notes">
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
