import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck, Briefcase, Users as UsersIcon, UserX, UserCheck } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select } from '@/components/shared/FormField';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface User { id: number; name: string; email: string; role: string; is_active: boolean; created_at: string; }

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  admin:    { label: 'Admin',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  worker:   { label: 'Worker',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  employer: { label: 'Employer', color: 'bg-violet-50 text-violet-700 border-violet-200' },
};

const emptyForm = { name: '', email: '', password: '', role: 'worker', is_active: true };

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(() => {
    apiGet<User[]>('/api/auth/users').then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function openCreate() { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); }

  function openEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, is_active: u.is_active });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email.trim()) e.email = 'Email required';
    if (!editing && !form.password) e.password = 'Password required for new user';
    if (form.password && form.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiPut(`/api/auth/users/${editing.id}`, form);
      } else {
        await apiPost('/api/auth/users', form);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(u: User) {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    await apiDelete(`/api/auth/users/${u.id}`);
    fetchUsers();
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="flex-1 max-w-xs bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> Add User
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Joined</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => {
                const rc = ROLE_CONFIG[u.role] || { label: u.role, color: 'bg-slate-100 text-slate-600' };
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${u.role === 'admin' ? 'bg-blue-600' : u.role === 'employer' ? 'bg-violet-600' : 'bg-emerald-600'}`}>
                          {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${rc.color}`}>
                        {u.role === 'admin' ? <ShieldCheck size={11} /> : u.role === 'employer' ? <Briefcase size={11} /> : <UsersIcon size={11} />}
                        {rc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs hidden md:table-cell">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          <UserCheck size={11} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <UserX size={11} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(u)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add New User'}>
        <div className="space-y-4">
          <FormField label="Full Name" required error={errors.name}>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={!!errors.name} placeholder="Full name" />
          </FormField>
          <FormField label="Email Address" required error={errors.email}>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={!!errors.email} placeholder="user@dukamo.com" />
          </FormField>
          <FormField label={editing ? 'New Password (leave blank to keep)' : 'Password'} required={!editing} error={errors.password}>
            <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} error={!!errors.password} placeholder="••••••••" />
          </FormField>
          <FormField label="Role">
            <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="worker">Worker</option>
              <option value="employer">Employer</option>
              <option value="admin">Admin</option>
            </Select>
          </FormField>
          {editing && (
            <FormField label="Account Status">
              <Select value={String(form.is_active)} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </FormField>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
