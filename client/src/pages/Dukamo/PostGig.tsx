import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['technology', 'construction', 'healthcare', 'agriculture', 'education', 'logistics', 'cleaning', 'delivery', 'design', 'writing', 'other'];
const empty = { title: '', description: '', category: '', budget: '', currency: 'ETB', location: '', is_remote: false, deadline: '' };

export function PostGig() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  function f(key: string, val: string | boolean) { setForm(p => ({ ...p, [key]: val })); }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.budget || Number(form.budget) <= 0) e.budget = 'Budget is required';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const gig = await apiPost<{ id: number }>('/api/gigs', {
        ...form,
        poster_id: user?.id,
        budget: Number(form.budget),
        is_remote: form.is_remote,
      });
      navigate(`/dukamo/gigs/${gig.id}`);
    } catch (err) {
      alert('Error: ' + err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dukamo/gigs')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Post a Gig Task</h1>
          <p className="text-slate-500 text-sm">Get skilled workers to bid on your task</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <FormField label="Task Title" required error={errors.title}>
          <Input value={form.title} onChange={e => f('title', e.target.value)} placeholder="e.g. Paint office walls, Fix electrical wiring" error={!!errors.title} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category" required error={errors.category}>
            <Select value={form.category} onChange={e => f('category', e.target.value)} error={!!errors.category}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Budget (ETB)" required error={errors.budget}>
            <Input type="number" value={form.budget} onChange={e => f('budget', e.target.value)} placeholder="e.g. 5000" error={!!errors.budget} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Location">
            <Input value={form.location} onChange={e => f('location', e.target.value)} placeholder="e.g. Bole, Addis Ababa" disabled={form.is_remote} />
          </FormField>
          <FormField label="Deadline">
            <Input type="date" value={form.deadline} onChange={e => f('deadline', e.target.value)} />
          </FormField>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <input type="checkbox" id="remote" checked={form.is_remote} onChange={e => f('is_remote', e.target.checked)} className="w-4 h-4 text-violet-600 rounded" />
          <label htmlFor="remote" className="text-sm text-slate-700 font-medium">This task can be done remotely</label>
        </div>

        <FormField label="Task Description" required error={errors.description}>
          <Textarea value={form.description} onChange={e => f('description', e.target.value)} rows={5} placeholder="Describe the task in detail: what needs to be done, materials included, expected quality..." error={!!errors.description} />
        </FormField>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button onClick={() => navigate('/dukamo/gigs')} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-60">
            {saving ? 'Posting...' : 'Post Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
