import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Briefcase, Zap, DollarSign, Globe, Award, TrendingUp,
  MessageSquare, BarChart3, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { apiGet } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { DukamoDashboard } from '@/types';

function StatCard({ title, value, sub, icon: Icon, accent, to }: {
  title: string; value: string | number; sub?: string; icon: any; accent: string; to?: string;
}) {
  const card = (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 ${to ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export function AdminDashboard() {
  const [data, setData] = useState<DukamoDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<DukamoDashboard>('/api/dukamo-dashboard')
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertTriangle size={32} className="text-red-400" />
      <p className="text-slate-500 text-sm">Failed to load dashboard data</p>
      <button onClick={() => window.location.reload()} className="text-sm text-emerald-600 hover:underline">Try again</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dukamo Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Platform overview — Africa's #1 Work Marketplace</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Workers" value={data.totalWorkers} sub={`${data.verifiedWorkers} verified`} icon={Users} accent="bg-blue-500" to="/jobs" />
        <StatCard title="Employers" value={data.totalEmployers} icon={Briefcase} accent="bg-violet-500" to="/jobs" />
        <StatCard title="Active Jobs" value={data.activeJobs} sub={`${data.totalJobs} total posted`} icon={TrendingUp} accent="bg-emerald-500" to="/jobs" />
        <StatCard title="Open Gigs" value={data.openGigs} sub={`${data.totalGigs} total posted`} icon={Zap} accent="bg-orange-500" to="/gigs" />
      </div>

      {/* Revenue + Activity */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Applications" value={data.totalApplications} icon={CheckCircle2} accent="bg-pink-500" />
        <StatCard title="Gig Bids" value={data.totalBids} icon={Award} accent="bg-amber-500" />
        <StatCard title="Messages Sent" value={data.totalMessages} icon={MessageSquare} accent="bg-teal-500" to="/messages" />
        <StatCard title="Confirmed Revenue" value={formatCurrency(data.confirmedRevenue)} sub={`${formatCurrency(data.totalGmv)} GMV`} icon={DollarSign} accent="bg-rose-500" to="/payments" />
      </div>

      {/* Country Stats + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Globe size={16} className="text-emerald-500" /> Users by Country</h2>
          </div>
          {data.countryStats.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No country data yet</p>
          ) : (
            <div className="space-y-2.5">
              {data.countryStats.map((c, i) => {
                const max = data.countryStats[0].users;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-24 truncate flex-shrink-0">{c.country}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${(c.users / max) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 w-8 text-right">{c.users}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><BarChart3 size={16} className="text-blue-500" /> Top Categories</h2>
          </div>
          {data.topCategories.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-2.5">
              {data.topCategories.map((c, i) => {
                const max = data.topCategories[0].count;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-28 truncate flex-shrink-0 capitalize">{c.category}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(c.count / max) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 w-6 text-right">{c.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Jobs + Recent Gigs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Latest Jobs</h2>
            <Link to="/jobs" className="text-xs text-emerald-600 hover:underline font-medium">View all</Link>
          </div>
          {data.recentJobs.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No jobs posted yet</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentJobs.map(j => (
                <li key={j.id} className="px-5 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{j.title}</p>
                    <p className="text-xs text-slate-400">{j.company_name} · {j.country}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-emerald-600">{j.currency} {j.salary_min ? `${j.salary_min.toLocaleString()}+` : 'Negotiable'}</p>
                    <p className="text-xs text-slate-400">{formatDate(j.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Gigs */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Latest Gigs</h2>
            <Link to="/gigs" className="text-xs text-emerald-600 hover:underline font-medium">View all</Link>
          </div>
          {data.recentGigs.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No gigs posted yet</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentGigs.map(g => (
                <li key={g.id} className="px-5 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{g.title}</p>
                    <p className="text-xs text-slate-400">{g.poster_name} · {g.is_remote ? 'Remote' : g.country}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-violet-600">{g.currency} {g.budget.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{formatDate(g.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* International Growth CTA */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2"><Globe size={18} className="text-emerald-400" /> International Expansion</h2>
            <p className="text-slate-400 text-sm mt-1">Connect African workers with global employers in US, EU, and the Gulf</p>
          </div>
          <div className="flex gap-3">
            <Link to="/global" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap">Global Talent</Link>
            <Link to="/analytics" className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">Analytics</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
