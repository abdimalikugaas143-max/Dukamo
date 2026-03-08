import { useState, useEffect } from 'react';
import { Briefcase, Zap, Users, Building2, TrendingUp } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { formatETB, timeAgo } from '@/lib/utils';
import type { DukamoDashboard } from '@/types';

export function DukamoAnalytics() {
  const [data, setData] = useState<DukamoDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<DukamoDashboard>('/api/dukamo-dashboard').then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!data) return <div className="text-center py-20 text-slate-500">Could not load analytics.</div>;

  const stats = [
    { label: 'Active Jobs', value: data.activeJobs, total: data.totalJobs, icon: Briefcase, color: 'blue' },
    { label: 'Open Gigs', value: data.openGigs, total: data.totalGigs, icon: Zap, color: 'violet' },
    { label: 'Workers', value: data.totalWorkers, icon: Users, color: 'emerald' },
    { label: 'Employers', value: data.totalEmployers, icon: Building2, color: 'amber' },
    { label: 'Applications', value: data.totalApplications, icon: TrendingUp, color: 'rose' },
    { label: 'Gig Bids', value: data.totalBids, icon: TrendingUp, color: 'indigo' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600', violet: 'bg-violet-100 text-violet-600',
    emerald: 'bg-emerald-100 text-emerald-600', amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600', indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Platform Analytics</h1>
        <p className="text-slate-500 text-sm">Dukamo marketplace overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[s.color]}`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{s.value.toLocaleString()}</p>
              {s.total !== undefined && s.total !== s.value && (
                <p className="text-xs text-slate-400 mt-1">{s.total.toLocaleString()} total</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Top categories */}
      {data.topCategories.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Top Categories</h2>
          <div className="space-y-3">
            {data.topCategories.map((cat, i) => {
              const max = data.topCategories[0].count;
              return (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                  <CategoryBadge category={cat.category} />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(cat.count / max) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 w-8 text-right">{cat.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent jobs */}
        {data.recentJobs.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Latest Jobs</h2>
            <div className="space-y-3">
              {data.recentJobs.map(j => (
                <div key={j.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{j.title}</p>
                    <p className="text-xs text-slate-400">{j.company_name} · {timeAgo(j.created_at)}</p>
                  </div>
                  <CategoryBadge category={j.category} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent gigs */}
        {data.recentGigs.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Latest Gigs</h2>
            <div className="space-y-3">
              {data.recentGigs.map(g => (
                <div key={g.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{g.title}</p>
                    <p className="text-xs text-slate-400">{g.poster_name} · {timeAgo(g.created_at)}</p>
                  </div>
                  <span className="text-sm font-bold text-violet-600">{formatETB(g.budget)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
