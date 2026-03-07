import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye, FolderKanban } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export interface Project {
  id: number;
  project_code: string;
  title: string;
  client_name?: string;
  description?: string;
  vehicle_type?: string;
  status: 'pending' | 'ongoing' | 'completed';
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
}

const VEHICLE_TYPES = ['Body truck', 'Trailer', 'Body tank', 'Trailer tank', 'Long truck', 'Underground tank', 'Maintenance', 'Accessories'];

const emptyForm = { project_code: '', title: '', client_name: '', description: '', vehicle_type: '', status: 'pending', start_date: '', end_date: '', notes: '' };

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    ongoing: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return <span className={`inline-block text-xs font-medium border px-2 py-0.5 rounded-full capitalize ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [viewing, setViewing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchProjects = useCallback(() => {
    const q = filterStatus ? `?status=${filterStatus}` : '';
    apiGet<Project[]>(`/api/projects${q}`).then(setProjects).finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  function openCreate() { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({ project_code: p.project_code, title: p.title, client_name: p.client_name || '', description: p.description || '', vehicle_type: p.vehicle_type || '', status: p.status, start_date: p.start_date || '', end_date: p.end_date || '', notes: p.notes || '' });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.project_code.trim()) e.project_code = 'Project code required';
    if (!form.title.trim()) e.title = 'Title required';
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiPut(`/api/projects/${editing.id}`, form);
      } else {
        await apiPost('/api/projects', form);
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(p: Project) {
    if (!confirm(`Delete project "${p.title}"?`)) return;
    await apiDelete(`/api/projects/${p.id}`);
    fetchProjects();
  }

  const counts = { pending: 0, ongoing: 0, completed: 0 };
  projects.forEach(p => { if (p.status in counts) counts[p.status as keyof typeof counts]++; });

  const columns = [
    { key: 'project_code', header: 'Code', render: (r: Project) => <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{r.project_code}</span> },
    { key: 'title', header: 'Project Title', render: (r: Project) => <span className="font-medium text-slate-800">{r.title}</span> },
    { key: 'client_name', header: 'Client', render: (r: Project) => r.client_name || '—' },
    { key: 'vehicle_type', header: 'Vehicle Type', render: (r: Project) => r.vehicle_type || '—' },
    { key: 'start_date', header: 'Start', render: (r: Project) => formatDate(r.start_date) },
    { key: 'end_date', header: 'End', render: (r: Project) => formatDate(r.end_date) },
    { key: 'status', header: 'Status', render: (r: Project) => <StatusPill status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      {/* Status summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', key: 'pending', color: 'amber', icon: '⏳' },
          { label: 'Ongoing', key: 'ongoing', color: 'blue', icon: '🔧' },
          { label: 'Completed', key: 'completed', color: 'emerald', icon: '✅' },
        ].map(({ label, key, color, icon }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
            className={`bg-white rounded-xl border-2 p-4 text-center transition-all ${filterStatus === key ? `border-${color}-400 bg-${color}-50` : 'border-slate-200 hover:border-slate-300'}`}
          >
            <p className="text-xl mb-1">{icon}</p>
            <p className="text-2xl font-bold text-slate-800">{counts[key as keyof typeof counts]}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <p className="text-slate-500 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          {filterStatus && (
            <button onClick={() => setFilterStatus('')} className="text-xs text-blue-600 hover:underline">Clear filter</button>
          )}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
      ) : (
        <DataTable
          data={projects}
          columns={columns}
          searchKeys={['project_code', 'title', 'client_name', 'vehicle_type']}
          emptyMessage="No projects yet. Create your first project."
          actions={(row) => {
            const p = row as unknown as Project;
            return (
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => { setViewing(p); setViewModal(true); }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Eye size={15} /></button>
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
            );
          }}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Project' : 'New Project'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Project Code" required error={errors.project_code}>
            <Input value={form.project_code} onChange={e => setForm(f => ({ ...f, project_code: e.target.value.toUpperCase() }))} error={!!errors.project_code} placeholder="PROJ-001" />
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="pending">Pending</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </Select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Project Title" required error={errors.title}>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} error={!!errors.title} placeholder="Body Truck Build — Client Name" />
            </FormField>
          </div>
          <FormField label="Client Name">
            <Input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="ABC Transport Ltd" />
          </FormField>
          <FormField label="Vehicle Type">
            <Select value={form.vehicle_type} onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))}>
              <option value="">Select vehicle type...</option>
              {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
            </Select>
          </FormField>
          <FormField label="Start Date">
            <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
          </FormField>
          <FormField label="End Date">
            <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Description">
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Project description, scope, objectives..." />
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
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Project Details" size="md">
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FolderKanban size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{viewing.title}</p>
                <p className="text-xs text-slate-500 font-mono">{viewing.project_code}</p>
              </div>
              <div className="ml-auto"><StatusPill status={viewing.status} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 rounded-xl p-4">
              <div><span className="text-slate-500 text-xs">Client</span><p className="font-medium">{viewing.client_name || '—'}</p></div>
              <div><span className="text-slate-500 text-xs">Vehicle Type</span><p className="font-medium">{viewing.vehicle_type || '—'}</p></div>
              <div><span className="text-slate-500 text-xs">Start Date</span><p className="font-medium">{formatDate(viewing.start_date) || '—'}</p></div>
              <div><span className="text-slate-500 text-xs">End Date</span><p className="font-medium">{formatDate(viewing.end_date) || '—'}</p></div>
            </div>
            {viewing.description && <div><h4 className="text-sm font-semibold text-slate-700 mb-1">Description</h4><p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">{viewing.description}</p></div>}
            {viewing.notes && <div><h4 className="text-sm font-semibold text-slate-700 mb-1">Notes</h4><p className="text-sm text-slate-600 whitespace-pre-wrap">{viewing.notes}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
