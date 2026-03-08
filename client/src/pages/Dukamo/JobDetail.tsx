import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Eye, Building2, ExternalLink, Users } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { FormField, Select, Textarea } from '@/components/shared/FormField';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { apiGet, apiPost } from '@/lib/api';
import { formatETB, formatDate, timeAgo } from '@/lib/utils';
import type { JobPost, WorkerProfile } from '@/types';

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [form, setForm] = useState({ worker_id: '', cover_letter: '' });
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    apiGet<JobPost>(`/api/jobs/${id}`).then(setJob).catch(() => setJob(null)).finally(() => setLoading(false));
    apiGet<WorkerProfile[]>('/api/worker-profiles').then(setWorkers).catch(() => {});
  }, [id]);

  async function handleApply() {
    if (!form.worker_id) { alert('Select your worker profile first'); return; }
    setApplying(true);
    try {
      await apiPost(`/api/jobs/${id}/apply`, { worker_id: Number(form.worker_id), cover_letter: form.cover_letter });
      setApplied(true);
      setApplyOpen(false);
    } catch (err) {
      alert('Error: ' + err);
    } finally {
      setApplying(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!job) return <div className="text-center py-20 text-slate-500">Job not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={() => navigate('/dukamo/jobs')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-800">{job.title}</h1>
              {job.employer_verified && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Verified</span>}
            </div>
            <p className="text-blue-600 font-semibold mt-1 text-lg">{job.company_name}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
              {job.location && <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>}
              <span className="flex items-center gap-1.5"><Clock size={14} />Posted {timeAgo(job.created_at)}</span>
              <span className="flex items-center gap-1.5"><Eye size={14} />{job.views} views</span>
              <span className="flex items-center gap-1.5"><Users size={14} />{job.application_count ?? 0} applicants</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <CategoryBadge category={job.category} size="md" />
            <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full capitalize">{job.job_type?.replace('_', ' ')}</span>
            <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full capitalize">{job.experience_level} level</span>
          </div>
        </div>

        {(job.salary_min || job.salary_max) && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            <p className="text-emerald-700 font-semibold">
              Salary: {job.salary_min ? formatETB(job.salary_min) : ''}
              {job.salary_min && job.salary_max ? ' – ' : ''}
              {job.salary_max ? formatETB(job.salary_max) : ''} / month
            </p>
          </div>
        )}

        {job.deadline && (
          <p className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            Application deadline: {formatDate(job.deadline)}
          </p>
        )}

        <div className="mt-6">
          <h2 className="font-semibold text-slate-800 mb-3">Job Description</h2>
          <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{job.description}</div>
        </div>

        {job.skills_required && (
          <div className="mt-5">
            <h2 className="font-semibold text-slate-800 mb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills_required.split(',').map(s => (
                <span key={s} className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg">{s.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {job.employer_desc && (
          <div className="mt-5 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={16} className="text-slate-500" />
              <h2 className="font-semibold text-slate-700">About {job.company_name}</h2>
            </div>
            <p className="text-sm text-slate-600">{job.employer_desc}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
          {applied ? (
            <div className="flex-1 text-center py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-medium text-sm">
              ✓ Application submitted successfully!
            </div>
          ) : (
            <button onClick={() => setApplyOpen(true)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors">
              Apply for this Job
            </button>
          )}
          {job.employer_location && (
            <a href={`#`} className="flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              <ExternalLink size={15} /> Company Profile
            </a>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={applyOpen} onClose={() => setApplyOpen(false)} title={`Apply — ${job.title}`}>
        <div className="space-y-4">
          <FormField label="Your Worker Profile" required>
            <Select value={form.worker_id} onChange={e => setForm(f => ({ ...f, worker_id: e.target.value }))}>
              <option value="">Select your profile</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name || `Worker #${w.id}`}</option>)}
            </Select>
          </FormField>
          {workers.length === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              Create a worker profile first to apply.
            </p>
          )}
          <FormField label="Cover Letter" hint="Why are you the right person for this job?">
            <Textarea value={form.cover_letter} onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))} rows={5} placeholder="Introduce yourself and your relevant experience..." />
          </FormField>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button onClick={() => setApplyOpen(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={handleApply} disabled={applying} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
