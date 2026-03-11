import { useState, useEffect } from 'react';
import { Gift, Copy, CheckCircle, Users, DollarSign, TrendingUp, Share2 } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Referral } from '@/types';

interface ReferralData {
  referral_code: string;
  referral_link: string;
  referrals: Referral[];
  total_referred: number;
  total_earned: number;
  pending_rewards: number;
}

export function Referrals() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiGet<ReferralData>('/api/referrals/my')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function copyLink() {
    if (!data) return;
    navigator.clipboard.writeText(data.referral_link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Refer & Earn</h1>
        <p className="text-slate-500 text-sm mt-1">Invite friends and earn ETB 50 for every person who joins Dukamo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Users size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{data?.total_referred || 0}</p>
          <p className="text-xs text-slate-500 mt-0.5">Referred</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <DollarSign size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{data?.total_earned || 0}</p>
          <p className="text-xs text-slate-500 mt-0.5">ETB Earned</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{data?.pending_rewards || 0}</p>
          <p className="text-xs text-slate-500 mt-0.5">Pending</p>
        </div>
      </div>

      {/* Referral code box */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={18} />
          <h2 className="font-semibold">Your Referral Code</h2>
        </div>
        <p className="text-emerald-100 text-sm mb-4">Share this link — you earn ETB 50 when they complete their first gig or get hired</p>
        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <p className="text-xs text-emerald-200 mb-1">Your unique code</p>
          <p className="text-2xl font-bold font-mono tracking-widest">{data?.referral_code || '—'}</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-white/10 rounded-xl px-4 py-2.5 text-sm text-emerald-100 truncate text-xs">
            {data?.referral_link}
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 bg-white text-emerald-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors hover:bg-emerald-50 flex-shrink-0"
          >
            {copied ? <><CheckCircle size={15} /> Copied!</> : <><Copy size={15} /> Copy</>}
          </button>
        </div>
      </div>

      {/* Share options */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Share2 size={16} /> Share Dukamo</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'WhatsApp', color: 'bg-green-100 text-green-700', url: `https://wa.me/?text=Join%20Dukamo%20-%20Africa's%20#1%20Work%20Marketplace!%20${encodeURIComponent(data?.referral_link || '')}` },
            { label: 'Telegram', color: 'bg-sky-100 text-sky-700', url: `https://t.me/share/url?url=${encodeURIComponent(data?.referral_link || '')}&text=Join%20Dukamo%20-%20Find%20jobs%20and%20gigs%20in%20Africa!` },
            { label: 'Facebook', color: 'bg-blue-100 text-blue-700', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data?.referral_link || '')}` },
            { label: 'Twitter/X', color: 'bg-slate-100 text-slate-700', url: `https://twitter.com/intent/tweet?text=Join%20Dukamo%20-%20Africa's%20#1%20Work%20Marketplace!&url=${encodeURIComponent(data?.referral_link || '')}` },
          ].map(({ label, color, url }) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer"
              className={`${color} text-center text-sm font-medium py-2.5 rounded-xl hover:opacity-80 transition-opacity`}
            >{label}</a>
          ))}
        </div>
      </div>

      {/* Referred users list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">People You've Referred</h2>
        </div>
        {!data?.referrals.length ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            No referrals yet. Share your link and start earning!
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.referrals.map(r => (
              <li key={r.id} className="px-5 py-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">{r.referred_name}</p>
                  <p className="text-xs text-slate-400">Joined {formatDate(r.joined_at || r.created_at)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${r.reward_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.reward_paid ? `ETB ${r.reward_amount} paid` : 'Pending'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
