import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Users, Eye, Clock } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { apiGet, apiPost, apiPut, apiPatch } from '@/lib/api';
import { formatDate, timeAgo } from '@/lib/utils';
import type { EmployerProfile, JobPost, JobApplication } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [applicantsOpen, setApplicantsOpen] = useState(false);
  const [pform, setPform] = useState({ company_name: '', industry: '', location: '', website: '', description: '' });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const all = await apiGet<EmployerProfile[]>('/api/employer-profiles');
      const mine = all.find(e => e.user_id === user?.id) || null;
      setProfile(mine);
      if (mine) {
        const allJobs = await apiGet<JobPost[]>(`/api/jobs?status=all&employer_id=${mine.id}`);
        setJobs(allJobs.filter(j => j.employer_id === mine.id));
      }
    } catch { setProfile(null); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  function openProfile() {
    if (profile) setPform({ company_name: profile.company_name, industry: profile.industry || '', location: profile.location || '', website: profile.website || '', description: profile.description || '' });
    setProfileOpen(true);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const payload = { ...pform, user_id: user?.id };
      if (profile) await apiPut(`/api/employer-profiles/${profile.id}`, payload);
      else await apiPost('/api/employer-profiles', payload);
      setProfileOpen(false);
      loadData();
    } catch (err) { alert('Error: ' + err); }
    finally { setSaving(false); }
  }

  async function viewApplicants(job: JobPost) {
    setSelectedJob(job);
    setApplicantsOpen(true);
    try {
      const apps = await apiGet<JobApplication[]>(`/api/jobs/${job.id}/applications`);
      setApplicants(apps);
    } catch { setApplicants([]); }
  }

  async function updateStatus(appId: number, status: string) {
    try {
      await apiPatch(`/api/job-applications/${appId}`, { status });
      if (selectedJob) {
        const apps = await apiGet<JobApplication[]>(`/api/jobs/${selectedJob.id}/applications`);
        setApplicants(apps);
      }
    } catch (err) { alert('Error: ' + err); }
  }

  const statusColor: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', reviewed: 'bg-blue-100 text-blue-700', shortlisted: 'bg-violet-100 text-violet-700', rejected: 'bg-red-100 text-red-700', hired: 'bg-emerald-100 text-emerald-700' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employer Dashboard</h1>
          <p className="text-slate-500 text-sm">{profile ? profile.company_name : 'Manage your hiring on Dukamo'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openProfile} className="px-4 py-2 text-sm border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50">
            {profile ? 'Edit Company' : 'Setup Company'}
          </button>
          {profile && (
            <button onClick={() => navigate('/dukamo/jobs/post')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Plus size={16} /> Post Job
            </button>
          )}
        </div>
      </div>

      {!profile ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <p className="text-blue-700 font-medium mb-3">Set up your company profile to start posting jobs</p>
          <button onClick={openProfile} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Create Company Profile</button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-slate-800">{jobs.length}</p>
              <p className="text-sm text-slate-500">Total Jobs Posted</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-slate-800">{jobs.filter(j => j.status === 'active').length}</p>
              <p className="text-sm text-slate-500">Active Jobs</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-slate-800">{jobs.reduce((s, j) => s + Number(j.application_count || 0), 0)}</p>
              <p className="text-sm text-slate-500">Total Applicants</p>
            </div>
          </div>

          {/* Jobs list */}
          {jobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 mb-3">No jobs posted yet.</p>
              <button onClick={() => navigate('/dukamo/jobs/post')} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Post First Job</button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800">{job.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${job.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{job.status}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Eye size={12} />{job.views} views</span>
                        <span className="flex items-center gap-1"><Users size={12} />{job.application_count ?? 0} applicants</span>
                        <span>Posted {timeAgo(job.created_at)}</span>
                        {job.deadline && <span className="flex items-center gap-1"><Clock size={12} />Deadline: {formatDate(job.deadline)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={job.category} />
                      <button onClick={() => viewApplicants(job)} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100">
                        View Applicants
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Company profile modal */}
      <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title={profile ? 'Edit Company Profile' : 'Create Company Profile'}>
        <div className="space-y-4">
          <FormField label="Company Name" required>
            <Input value={pform.company_name} onChange={e => setPform(f => ({ ...f, company_name: e.target.value }))} placeholder="e.g. Selam Construction PLC" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Industry">
              <Select value={pform.industry} onChange={e => setPform(f => ({ ...f, industry: e.target.value }))}>
                <option value="">Select industry</option>
                {['Technology', 'Construction', 'Healthcare', 'Agriculture', 'Finance', 'Logistics', 'Education', 'Manufacturing', 'Retail', 'Other'].map(i => <option key={i} value={i.toLowerCase()}>{i}</option>)}
              </Select>
            </FormField>
            <FormField label="Location">
              <Input value={pform.location} onChange={e => setPform(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Addis Ababa" />
            </FormField>
          </div>
          <FormField label="Website">
            <Input value={pform.website} onChange={e => setPform(f => ({ ...f, website: e.target.value }))} placeholder="https://company.et" />
          </FormField>
          <FormField label="Company Description">
            <Textarea value={pform.description} onChange={e => setPform(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="What does your company do?" />
          </FormField>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button onClick={() => setProfileOpen(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg">Cancel</button>
            <button onClick={saveProfile} disabled={saving} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg disabled:opacity-60">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Applicants modal */}
      <Modal isOpen={applicantsOpen} onClose={() => setApplicantsOpen(false)} title={`Applicants — ${selectedJob?.title}`} size="lg">
        {applicants.length === 0 ? (
          <div className="text-center py-10 text-slate-400">No applications yet.</div>
        ) : (
          <div className="space-y-4">
            {applicants.map(a => (
              <div key={a.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-800">{a.worker_name}</p>
                    <p className="text-xs text-slate-400">Applied {timeAgo(a.applied_at)}</p>
                    {a.cover_letter && <p className="text-sm text-slate-600 mt-2">{a.cover_letter}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize text-center ${statusColor[a.status]}`}>{a.status}</span>
                    <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)} className="text-xs border border-slate-200 rounded px-2 py-1 bg-white">
                      {['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
