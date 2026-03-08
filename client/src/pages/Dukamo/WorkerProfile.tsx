import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Clock, Award } from 'lucide-react';
import { RatingStars } from '@/components/shared/RatingStars';
import { Avatar } from '@/components/shared/Avatar';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { apiGet } from '@/lib/api';
import { formatDate, timeAgo } from '@/lib/utils';
import type { WorkerProfile as WP, Review } from '@/types';

interface WorkerWithBadges extends WP {
  badges: { name: string; category: string; icon?: string; earned_at: string }[];
  reviews: Review[];
}

export function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<WorkerWithBadges | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<WorkerWithBadges>(`/api/worker-profiles/${id}`)
      .then(setWorker).catch(() => setWorker(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!worker) return <div className="text-center py-20 text-slate-500">Worker not found.</div>;

  const availColor: Record<string, string> = { available: 'bg-emerald-100 text-emerald-700', busy: 'bg-amber-100 text-amber-700', unavailable: 'bg-slate-100 text-slate-500' };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Avatar name={worker.name || 'Worker'} size="lg" verified={worker.verified} />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800">{worker.name}</h1>
              {worker.verified && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Verified</span>}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${availColor[worker.availability]}`}>{worker.availability}</span>
            </div>
            <RatingStars rating={worker.rating} totalReviews={worker.total_reviews} size={14} />
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
              {worker.location && <span className="flex items-center gap-1"><MapPin size={13} />{worker.location}</span>}
              {worker.experience_years > 0 && <span className="flex items-center gap-1"><Clock size={13} />{worker.experience_years} yrs experience</span>}
              {worker.hourly_rate && <span className="font-medium text-blue-600">ETB {worker.hourly_rate}/hr</span>}
              {worker.portfolio_url && (
                <a href={worker.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                  <Globe size={13} />Portfolio
                </a>
              )}
            </div>
          </div>
        </div>

        {worker.bio && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600 leading-relaxed">{worker.bio}</p>
          </div>
        )}

        {worker.skills && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {worker.skills.split(',').map(s => (
                <span key={s} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg">{s.trim()}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Badges */}
      {worker.badges.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Award size={16} className="text-amber-500" />Skill Badges</h2>
          <div className="flex flex-wrap gap-2">
            {worker.badges.map(b => (
              <div key={b.name} className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                {b.icon ? <span>{b.icon}</span> : <Award size={14} className="text-amber-500" />}
                <div>
                  <p className="text-xs font-medium text-amber-800">{b.name}</p>
                  <CategoryBadge category={b.category} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {worker.reviews.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Reviews</h2>
          <div className="space-y-4">
            {worker.reviews.map(r => (
              <div key={r.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{r.reviewer_name}</span>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={r.rating} size={12} showValue={false} />
                    <span className="text-xs text-slate-400">{timeAgo(r.created_at)}</span>
                  </div>
                </div>
                {r.comment && <p className="text-sm text-slate-600 mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-slate-400 text-center">Member since {formatDate(worker.created_at)}</div>
    </div>
  );
}
