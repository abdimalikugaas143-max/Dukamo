import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import { apiPost, apiGet } from '@/lib/api';
import { useEffect } from 'react';
import type { EmployerProfile } from '@/types';

const CATEGORIES = ['technology', 'construction', 'healthcare', 'agriculture', 'education', 'finance', 'logistics', 'hospitality', 'manufacturing', 'retail', 'design', 'other'];

const empty = { employer_id: '', title: '', description: '', category: '', job_type: 'full_time', location: '', salary_min: '', salary_max: '', currency: 'ETB', skills_required: '', experience_level: 'entry', deadline: '' };

export function PostJob() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [employers, setEmployers] = useState<EmployerProfile[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiGet<EmployerProfile[]>('/api/employer-profiles').then(setEmployers).catch(() => {});
  }, []);

  function f(key: string, val: string) { setForm(p => ({ ...p, [key]: val })); }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.employer_id) e.employer_id = 'Select an employer';
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category) e.category = 'Category is required';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const job = await apiPost<{ id: number }>('/api/jobs', {
        ...form,
        employer_id: Number(form.employer_id),
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
      });
      navigate(`/dukamo/jobs/${job.id}`);
    } catch (err) {
      alert('Error: ' + err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dukamo/jobs')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Post a Job</h1>
          <p className="text-slate-500 text-sm">Reach Ethiopia's largest talent pool</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <FormField label="Company / Employer" required error={errors.employer_id}>
          <Select value={form.employer_id} onChange={e => f('employer_id', e.target.value)} error={!!errors.employer_id}>
            <option value="">Select employer profile</option>
            {employers.map(e => <option key={e.id} value={e.id}>{e.company_name}</option>)}
          </Select>
        </FormField>
        {employers.length === 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            No employer profiles yet. <button className="underline font-medium" onClick={() => navigate('/dukamo/employer/new')}>Create one first →</button>
          </p>
        )}

        <FormField label="Job Title" required error={errors.title}>
          <Input value={form.title} onChange={e => f('title', e.target.value)} placeholder="e.g. Senior Welder, Software Developer" error={!!errors.title} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category" required error={errors.category}>
            <Select value={form.category} onChange={e => f('category', e.target.value)} error={!!errors.category}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Job Type">
            <Select value={form.job_type} onChange={e => f('job_type', e.target.value)}>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Experience Level">
            <Select value={form.experience_level} onChange={e => f('experience_level', e.target.value)}>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </Select>
          </FormField>
          <FormField label="Location">
            <Input value={form.location} onChange={e => f('location', e.target.value)} placeholder="e.g. Addis Ababa" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Min Salary (ETB/mo)">
            <Input type="number" value={form.salary_min} onChange={e => f('salary_min', e.target.value)} placeholder="e.g. 8000" />
          </FormField>
          <FormField label="Max Salary (ETB/mo)">
            <Input type="number" value={form.salary_max} onChange={e => f('salary_max', e.target.value)} placeholder="e.g. 25000" />
          </FormField>
        </div>

        <FormField label="Skills Required" hint="Comma-separated, e.g. Welding, AutoCAD, Safety">
          <Input value={form.skills_required} onChange={e => f('skills_required', e.target.value)} placeholder="Python, Sales, Forklift..." />
        </FormField>

        <FormField label="Application Deadline">
          <Input type="date" value={form.deadline} onChange={e => f('deadline', e.target.value)} />
        </FormField>

        <FormField label="Job Description" required error={errors.description}>
          <Textarea value={form.description} onChange={e => f('description', e.target.value)} rows={6} placeholder="Describe responsibilities, qualifications, benefits..." error={!!errors.description} />
        </FormField>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button onClick={() => navigate('/dukamo/jobs')} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
