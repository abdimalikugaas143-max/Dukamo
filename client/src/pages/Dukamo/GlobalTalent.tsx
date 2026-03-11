import { useState, useEffect } from 'react';
import { Globe, Briefcase, Zap, ArrowRight, CheckCircle, Star, MapPin, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { WorkerProfile, JobPost } from '@/types';

const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'Canada', 'UAE', 'Saudi Arabia', 'Australia', 'Netherlands'];

export function GlobalTalent() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [remoteJobs, setRemoteJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet<WorkerProfile[]>('/api/worker-profiles?remote=true&limit=6'),
      apiGet<{ jobs: JobPost[] }>('/api/jobs?remote=true&limit=6'),
    ])
      .then(([ws, js]) => {
        setWorkers(Array.isArray(ws) ? ws.slice(0, 6) : []);
        setRemoteJobs(Array.isArray(js) ? js.slice(0, 6) : (js as any).jobs?.slice(0, 6) || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-full mb-4 font-medium">
            <Globe size={12} /> International Talent Platform
          </div>
          <h1 className="text-3xl font-extrabold mb-3 leading-tight">
            African Talent.<br />
            <span className="text-emerald-400">Global Opportunities.</span>
          </h1>
          <p className="text-slate-300 text-base mb-6">
            Connect Ethiopian and East African workers with employers in the US, Europe, UAE, and beyond.
            Remote-first, skills-verified, diaspora-powered.
          </p>
          <div className="flex flex-wrap gap-3">
            {user?.role === 'employer' ? (
              <Link to="/jobs/post" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                <Briefcase size={16} /> Post a Global Job <ArrowRight size={14} />
              </Link>
            ) : (
              <Link to="/jobs?remote=true" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                <Briefcase size={16} /> Browse Remote Jobs <ArrowRight size={14} />
              </Link>
            )}
            <Link to="/gigs?remote=true" className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              <Zap size={16} /> Remote Gigs
            </Link>
          </div>
        </div>
      </div>

      {/* Why Dukamo Global */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: CheckCircle, title: 'Verified Talent', desc: 'ID-verified workers with proven skill badges and rated portfolios', color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { icon: Globe, title: '5 Countries', desc: 'Talent from Ethiopia, Kenya, Uganda, Tanzania and diaspora worldwide', color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: DollarSign, title: 'USD / EUR Payouts', desc: 'Pay in your currency via Payoneer or bank transfer — workers receive locally', color: 'text-violet-500', bg: 'bg-violet-50' },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm mb-1">{title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Hiring from countries */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Employers Hiring from These Countries</h2>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map(c => (
            <span key={c} className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full">
              <Globe size={11} /> {c}
            </span>
          ))}
        </div>
      </div>

      {/* Remote-ready Workers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Remote-Ready African Workers</h2>
          <Link to="/jobs" className="text-xs text-emerald-600 hover:underline font-medium">Browse all workers</Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : workers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            No remote-ready workers yet. Workers can enable "Open to international remote work" in their profile.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map(w => (
              <Link key={w.id} to={`/profile/${w.id}`} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 font-bold text-emerald-700 text-sm">
                    {(w.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{w.name || 'Worker'}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} />{w.location || w.country}</p>
                  </div>
                  {w.verified && <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">✓</span>}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{w.skills || 'No skills listed'}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                    <Star size={10} fill="currentColor" /> {w.rating?.toFixed(1) || '0.0'}
                    <span className="text-slate-400">({w.total_reviews})</span>
                  </span>
                  {w.hourly_rate && <span className="text-xs font-semibold text-slate-700">{w.currency || 'ETB'} {w.hourly_rate}/hr</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Remote Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Remote International Jobs</h2>
          <Link to="/jobs?remote=true" className="text-xs text-emerald-600 hover:underline font-medium">See all</Link>
        </div>
        {remoteJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            No remote jobs posted yet. Be the first to post a global job!
          </div>
        ) : (
          <div className="space-y-3">
            {remoteJobs.map(j => (
              <Link key={j.id} to={`/jobs/${j.id}`} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">{j.title}</p>
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">Remote</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{j.company_name} · {j.country}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-emerald-600">{j.currency} {j.salary_min ? `${j.salary_min.toLocaleString()}+` : 'Negotiable'}</p>
                  <p className="text-xs text-slate-400 capitalize">{j.experience_level} level</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
