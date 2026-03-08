import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Wifi, Clock, User } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { RatingStars } from '@/components/shared/RatingStars';
import { Avatar } from '@/components/shared/Avatar';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { formatETB, formatDate, timeAgo } from '@/lib/utils';
import type { GigTask, GigBid, WorkerProfile } from '@/types';

interface GigWithBids extends GigTask { bids: GigBid[]; }

export function GigDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gig, setGig] = useState<GigWithBids | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidOpen, setBidOpen] = useState(false);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [form, setForm] = useState({ worker_id: '', bid_amount: '', proposal: '', delivery_days: '' });
  const [bidding, setBidding] = useState(false);
  const [bidPlaced, setBidPlaced] = useState(false);

  function loadGig() {
    apiGet<GigWithBids>(`/api/gigs/${id}`).then(setGig).catch(() => setGig(null)).finally(() => setLoading(false));
  }

  useEffect(() => {
    loadGig();
    apiGet<WorkerProfile[]>('/api/worker-profiles').then(setWorkers).catch(() => {});
  }, [id]);

  async function handleBid() {
    if (!form.worker_id || !form.bid_amount) { alert('Worker profile and bid amount are required'); return; }
    setBidding(true);
    try {
      await apiPost(`/api/gigs/${id}/bid`, {
        worker_id: Number(form.worker_id),
        bid_amount: Number(form.bid_amount),
        proposal: form.proposal,
        delivery_days: form.delivery_days ? Number(form.delivery_days) : null,
      });
      setBidPlaced(true);
      setBidOpen(false);
      loadGig();
    } catch (err) {
      alert('Error: ' + err);
    } finally {
      setBidding(false);
    }
  }

  async function handleAccept(bidId: number) {
    if (!confirm('Accept this bid? Other bids will be rejected.')) return;
    try {
      await apiPatch(`/api/gigs/${id}/assign/${bidId}`, {});
      loadGig();
    } catch (err) {
      alert('Error: ' + err);
    }
  }

  async function handleComplete() {
    if (!confirm('Mark this gig as completed?')) return;
    try {
      await apiPatch(`/api/gigs/${id}/complete`, {});
      loadGig();
    } catch (err) {
      alert('Error: ' + err);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" /></div>;
  if (!gig) return <div className="text-center py-20 text-slate-500">Gig task not found.</div>;

  const statusColor: Record<string, string> = { open: 'bg-emerald-100 text-emerald-700', in_progress: 'bg-blue-100 text-blue-700', completed: 'bg-slate-100 text-slate-600', cancelled: 'bg-red-100 text-red-700' };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={() => navigate('/dukamo/gigs')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
        <ArrowLeft size={16} /> Back to Gigs
      </button>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-800">{gig.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor[gig.status] || ''}`}>{gig.status.replace('_', ' ')}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Posted by <span className="text-slate-700 font-medium">{gig.poster_name}</span> · {timeAgo(gig.created_at)}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-500">
              {gig.is_remote ? <span className="flex items-center gap-1 text-emerald-600"><Wifi size={14} />Remote task</span>
                : gig.location ? <span className="flex items-center gap-1"><MapPin size={14} />{gig.location}</span> : null}
              {gig.deadline && <span className="flex items-center gap-1"><Clock size={14} />Deadline: {formatDate(gig.deadline)}</span>}
              <span className="flex items-center gap-1"><User size={14} />{gig.bid_count ?? 0} bids</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-bold text-violet-600">{formatETB(gig.budget)}</p>
            <CategoryBadge category={gig.category} size="md" />
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-slate-800 mb-2">Task Description</h2>
          <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{gig.description}</div>
        </div>

        <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
          {gig.status === 'open' && (
            bidPlaced ? (
              <div className="flex-1 text-center py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-medium text-sm">✓ Bid submitted!</div>
            ) : (
              <button onClick={() => setBidOpen(true)} className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg text-sm">Place a Bid</button>
            )
          )}
          {gig.status === 'in_progress' && (
            <button onClick={handleComplete} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm">Mark as Completed</button>
          )}
        </div>
      </div>

      {/* Bids */}
      {gig.bids.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 mb-4">{gig.bids.length} Bid{gig.bids.length !== 1 ? 's' : ''}</h2>
          <div className="space-y-3">
            {gig.bids.map(bid => (
              <div key={bid.id} className={`p-4 rounded-lg border ${bid.status === 'accepted' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={bid.worker_name || 'Worker'} size="sm" />
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{bid.worker_name || `Worker #${bid.worker_id}`}</p>
                      <RatingStars rating={bid.worker_rating || 0} size={12} showValue />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-violet-600">{formatETB(bid.bid_amount)}</p>
                    {bid.delivery_days && <p className="text-xs text-slate-400">{bid.delivery_days} days</p>}
                    {bid.status === 'accepted' && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">Accepted</span>}
                  </div>
                </div>
                {bid.proposal && <p className="text-sm text-slate-600 mt-2">{bid.proposal}</p>}
                {gig.status === 'open' && bid.status === 'pending' && (
                  <button onClick={() => handleAccept(bid.id)} className="mt-3 px-4 py-1.5 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700">Accept This Bid</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bid Modal */}
      <Modal isOpen={bidOpen} onClose={() => setBidOpen(false)} title="Submit Your Bid">
        <div className="space-y-4">
          <FormField label="Your Worker Profile" required>
            <Select value={form.worker_id} onChange={e => setForm(f => ({ ...f, worker_id: e.target.value }))}>
              <option value="">Select your profile</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name || `Worker #${w.id}`}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Your Bid (ETB)" required>
              <Input type="number" value={form.bid_amount} onChange={e => setForm(f => ({ ...f, bid_amount: e.target.value }))} placeholder={String(gig.budget)} />
            </FormField>
            <FormField label="Delivery Time (days)">
              <Input type="number" value={form.delivery_days} onChange={e => setForm(f => ({ ...f, delivery_days: e.target.value }))} placeholder="e.g. 3" />
            </FormField>
          </div>
          <FormField label="Proposal" hint="Briefly explain your approach and why you're the best fit">
            <Textarea value={form.proposal} onChange={e => setForm(f => ({ ...f, proposal: e.target.value }))} rows={4} placeholder="I have 5 years experience in..." />
          </FormField>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button onClick={() => setBidOpen(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={handleBid} disabled={bidding} className="px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-60">
              {bidding ? 'Submitting...' : 'Place Bid'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
