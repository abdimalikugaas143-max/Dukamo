import { useState, useEffect } from 'react';
import { Award, Plus } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { apiGet, apiPost } from '@/lib/api';
import { formatETB } from '@/lib/utils';
import type { SkillBadge } from '@/types';

const CATS = ['technology', 'construction', 'healthcare', 'agriculture', 'logistics', 'finance', 'design', 'education', 'other'];

export function SkillsCenter() {
  const [badges, setBadges] = useState<SkillBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', description: '', price: '0', icon: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet<SkillBadge[]>('/api/skill-badges').then(setBadges).catch(() => setBadges([])).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!form.name || !form.category) { alert('Name and category required'); return; }
    setSaving(true);
    try {
      const b = await apiPost<SkillBadge>('/api/skill-badges', { ...form, price: Number(form.price) });
      setBadges(prev => [...prev, b]);
      setCreateOpen(false);
      setForm({ name: '', category: '', description: '', price: '0', icon: '' });
    } catch (err) { alert('Error: ' + err); }
    finally { setSaving(false); }
  }

  const filtered = filter ? badges.filter(b => b.category === filter) : badges;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Skills Center</h1>
          <p className="text-slate-500 text-sm">Earn verified badges to stand out to employers</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Badge
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 text-xs rounded-full font-medium border transition-colors ${!filter ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'}`}>
          All
        </button>
        {CATS.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 text-xs rounded-full font-medium border capitalize transition-colors ${filter === c ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Award size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No badges yet. Add the first skill badge!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(badge => (
            <div key={badge.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-amber-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">
                  {badge.icon || '🏅'}
                </div>
                <CategoryBadge category={badge.category} />
              </div>
              <h3 className="font-semibold text-slate-800 mt-3">{badge.name}</h3>
              {badge.description && <p className="text-sm text-slate-500 mt-1">{badge.description}</p>}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <span className="text-sm font-semibold text-amber-600">
                  {badge.price > 0 ? formatETB(badge.price) : 'Free'}
                </span>
                <button className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 font-medium">
                  {badge.price > 0 ? 'Enroll' : 'Earn Badge'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create badge modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Skill Badge">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Badge Name" required>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Certified Welder" />
            </FormField>
            <FormField label="Category" required>
              <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">Select</option>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price (ETB)" hint="0 for free">
              <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </FormField>
            <FormField label="Icon (emoji)">
              <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🏅" />
            </FormField>
          </div>
          <FormField label="Description">
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </FormField>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="px-6 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg disabled:opacity-60">{saving ? 'Adding...' : 'Add Badge'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
