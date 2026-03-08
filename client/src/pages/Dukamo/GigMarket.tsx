import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, MapPin, Clock, Wifi, Plus, Search } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { formatETB, timeAgo } from '@/lib/utils';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { useAuth } from '@/context/AuthContext';
import type { GigTask } from '@/types';

const CATEGORIES = ['technology', 'construction', 'healthcare', 'agriculture', 'education', 'logistics', 'cleaning', 'delivery', 'design', 'writing', 'other'];

export function GigMarket() {
  const [gigs, setGigs] = useState<GigTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [remote, setRemote] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const canPost = user?.role === 'employer' || user?.role === 'admin' || user?.role === 'ops';

  const fetchGigs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (category) params.append('category', category);
      if (remote) params.append('is_remote', remote);
      const data = await apiGet<GigTask[]>(`/api/gigs?${params}`);
      setGigs(data);
    } catch {
      setGigs([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, remote]);

  useEffect(() => { fetchGigs(); }, [fetchGigs]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {user?.role === 'worker' ? 'Find Gig Work' : 'Gig Marketplace'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {user?.role === 'worker'
              ? `${gigs.length} tasks available — click a task to place your bid`
              : `${gigs.length} tasks available — bid to get started`}
          </p>
        </div>
        {canPost && (
          <button onClick={() => navigate('/dukamo/gigs/post')} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> Post a Task
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={remote} onChange={e => setRemote(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
            <option value="">All Locations</option>
            <option value="true">Remote Only</option>
            <option value="false">On-site Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" /></div>
      ) : gigs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Zap size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">{canPost ? 'No gigs found. Try adjusting your filters or post the first task!' : 'No tasks available right now. Check back soon!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {gigs.map(gig => (
            <div key={gig.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => navigate(`/dukamo/gigs/${gig.id}`)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{gig.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">by {gig.poster_name} · {timeAgo(gig.created_at)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-violet-600">{formatETB(gig.budget)}</p>
                  <p className="text-xs text-slate-400">budget</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mt-3 line-clamp-2">{gig.description}</p>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {gig.is_remote ? (
                    <span className="flex items-center gap-1 text-emerald-600"><Wifi size={12} />Remote</span>
                  ) : gig.location ? (
                    <span className="flex items-center gap-1"><MapPin size={12} />{gig.location}</span>
                  ) : null}
                  {gig.deadline && <span className="flex items-center gap-1"><Clock size={12} />Due {gig.deadline}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <CategoryBadge category={gig.category} />
                  {Number(gig.bid_count) > 0 && (
                    <span className="text-xs text-slate-400">{gig.bid_count} bid{Number(gig.bid_count) !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
