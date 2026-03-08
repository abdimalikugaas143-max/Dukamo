import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Search, Plus, Eye } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { formatETB, timeAgo } from '@/lib/utils';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import type { JobPost } from '@/types';

const CATEGORIES = ['Technology', 'Construction', 'Healthcare', 'Agriculture', 'Education', 'Finance', 'Logistics', 'Hospitality', 'Manufacturing', 'Retail', 'Design', 'Other'];
const JOB_TYPES = ['full_time', 'part_time', 'contract', 'remote'];
const LEVELS = ['entry', 'mid', 'senior'];

export function JobBoard() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('');
  const [level, setLevel] = useState('');
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (category) params.append('category', category);
      if (jobType) params.append('job_type', jobType);
      if (level) params.append('experience_level', level);
      const data = await apiGet<JobPost[]>(`/api/jobs?${params}`);
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, jobType, level]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Job Board</h1>
          <p className="text-slate-500 text-sm mt-0.5">{jobs.length} open positions in Ethiopia</p>
        </div>
        <button
          onClick={() => navigate('/dukamo/jobs/post')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Post a Job
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs, companies..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
          </select>
          <select value={jobType} onChange={e => setJobType(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Types</option>
            {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
          <select value={level} onChange={e => setLevel(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Levels</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Job list */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Briefcase size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No jobs found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => navigate(`/dukamo/jobs/${job.id}`)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800 text-base">{job.title}</h3>
                    {job.employer_verified && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-medium">Verified</span>}
                  </div>
                  <p className="text-sm text-blue-600 font-medium mt-0.5">{job.company_name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                    {job.location && <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>}
                    <span className="flex items-center gap-1"><Clock size={12} />{timeAgo(job.created_at)}</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{job.views} views</span>
                    {(job.salary_min || job.salary_max) && (
                      <span className="font-medium text-emerald-600">
                        {job.salary_min ? formatETB(job.salary_min) : ''}
                        {job.salary_min && job.salary_max ? ' – ' : ''}
                        {job.salary_max ? formatETB(job.salary_max) : ''}/mo
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <CategoryBadge category={job.category} />
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{job.job_type?.replace('_', ' ')}</span>
                  {Number(job.application_count) > 0 && (
                    <span className="text-xs text-slate-400">{job.application_count} applied</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-3 line-clamp-2">{job.description}</p>
              {job.skills_required && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {job.skills_required.split(',').slice(0, 5).map(s => (
                    <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{s.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
