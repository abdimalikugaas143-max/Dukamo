import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Zap, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { formatETB, timeAgo } from '@/lib/utils';
import type { WorkerProfile, JobApplication, GigBid } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [bids, setBids] = useState<GigBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [form, setForm] = useState({ bio: '', location: '', skills: '', experience_years: '0', hourly_rate: '', availability: 'available', portfolio_url: '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'applications' | 'bids'>('applications');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const profiles = await apiGet<WorkerProfile[]>('/api/worker-profiles');
      const mine = profiles.find(p => p.user_id === user?.id) || null;
      setProfile(mine);
      if (mine) {
        const [apps, myBids] = await Promise.all([
          apiGet<JobApplication[]>(`/api/worker-profiles/${mine.id}/applications`),
          apiGet<GigBid[]>(`/api/worker-profiles/${mine.id}/bids`),
        ]);
        setApplications(apps);
        setBids(myBids);
      }
    } catch { setProfile(null); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  function openProfileForm() {
    if (profile) setForm({ bio: profile.bio || '', location: profile.location || '', skills: profile.skills || '', experience_years: String(profile.experience_years), hourly_rate: String(profile.hourly_rate || ''), availability: profile.availability, portfolio_url: profile.portfolio_url || '' });
    setProfileOpen(true);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const payload = { ...form, experience_years: Number(form.experience_years), hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null, user_id: user?.id };
      if (profile) await apiPut(`/api/worker-profiles/${profile.id}`, payload);
      else await apiPost('/api/worker-profiles', payload);
      setProfileOpen(false);
      loadData();
    } catch (err) { alert('Error: ' + err); }
    finally { setSaving(false); }
  }

  const appStatusIcon: Record<string, React.ReactNode> = {
    pending: <Clock size={14} className="text-amber-500" />,
    reviewed: <Clock size={14} className="text-blue-500" />,
    shortlisted: <CheckCircle size={14} className="text-emerald-500" />,
    hired: <CheckCircle size={14} className="text-green-600" />,
    rejected: <XCircle size={14} className="text-red-500" />,
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Worker Dashboard</h1>
          <p className="text-slate-500 text-sm">Track your applications and bids</p>
        </div>
        <button onClick={openProfileForm} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> {profile ? 'Edit Profile' : 'Create Profile'}
        </button>
      </div>

      {!profile ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
          <p className="text-amber-700 font-medium mb-3">Create your worker profile to apply for jobs and bid on gigs</p>
          <button onClick={openProfileForm} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium">Create Profile Now</button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Applications', value: applications.length, icon: Briefcase, color: 'blue' },
              { label: 'Bids Placed', value: bids.length, icon: Zap, color: 'violet' },
              { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, icon: CheckCircle, color: 'emerald' },
              { label: 'Hired', value: applications.filter(a => a.status === 'hired').length, icon: CheckCircle, color: 'green' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
            <button onClick={() => setTab('applications')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${tab === 'applications' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Job Applications ({applications.length})
            </button>
            <button onClick={() => setTab('bids')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${tab === 'bids' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Gig Bids ({bids.length})
            </button>
          </div>

          {tab === 'applications' && (
            applications.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No applications yet.</p>
                <button onClick={() => navigate('/dukamo/jobs')} className="mt-3 text-blue-600 text-sm hover:underline">Browse jobs →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(a => (
                  <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-800">{a.job_title}</p>
                      <p className="text-sm text-blue-600">{a.company_name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Applied {timeAgo(a.applied_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {appStatusIcon[a.status]}
                      <span className="text-sm capitalize text-slate-600">{a.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'bids' && (
            bids.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <Zap size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No bids placed yet.</p>
                <button onClick={() => navigate('/dukamo/gigs')} className="mt-3 text-violet-600 text-sm hover:underline">Browse gigs →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {bids.map(b => (
                  <div key={b.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-violet-300" onClick={() => navigate(`/dukamo/gigs/${b.task_id}`)}>
                    <div>
                      <p className="font-medium text-slate-800">{b.task_title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Bid: <span className="font-semibold text-violet-600">{formatETB(b.bid_amount)}</span> · {timeAgo(b.created_at)}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${b.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : b.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Profile Modal */}
      <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title={profile ? 'Edit Worker Profile' : 'Create Worker Profile'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Location">
            <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Addis Ababa, Hawassa" />
          </FormField>
          <FormField label="Hourly Rate (ETB)">
            <Input type="number" value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))} placeholder="e.g. 250" />
          </FormField>
          <FormField label="Years of Experience">
            <Input type="number" min="0" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))} />
          </FormField>
          <FormField label="Availability">
            <Select value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </Select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Skills" hint="Comma-separated">
              <Input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="e.g. Welding, Python, Driving, Masonry" />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Portfolio / GitHub / LinkedIn URL">
              <Input value={form.portfolio_url} onChange={e => setForm(f => ({ ...f, portfolio_url: e.target.value }))} placeholder="https://..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Bio">
              <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Tell employers about yourself, your experience, and what you're looking for..." />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
          <button onClick={() => setProfileOpen(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={saveProfile} disabled={saving} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
