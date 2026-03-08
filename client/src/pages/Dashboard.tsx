import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileSignature, DollarSign, AlertTriangle, ClipboardCheck, Truck, CheckCircle2, TrendingUp, Briefcase, Zap, CreditCard } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DashData {
  stats: {
    activeContractors: number; activeAgreements: number; totalContractValue: number;
    pendingPayments: number; pendingPaymentsAmount: number; overduePayments: number;
    pendingReviews: number; paidOutTotal: number; paidOutCount: number;
    projectStats: { pending: number; ongoing: number; completed: number };
  };
  recentDailyReports: any[];
  expiringContracts: any[];
  paymentsByStatus: { status: string; count: number; total: number }[];
  vehicleActivity: { vehicle_type: string; count: number }[];
  recentPayments: any[];
  dukamoStats: { workers: number; employers: number; openJobs: number; openGigs: number; applications: number; bids: number };
}

function ReviewDot({ status }: { status: string }) {
  if (status === 'approved') return <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 inline-block" />;
  if (status === 'rejected') return <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 inline-block" />;
  return <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 inline-block" />;
}

function StatCard({ title, value, sub, icon: Icon, accent }: { title: string; value: string | number; sub?: string; icon: any; accent: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
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
}

export function Dashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<DashData>('/api/dashboard')
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertTriangle size={32} className="text-red-400" />
      <p className="text-slate-500 text-sm">Failed to load dashboard data</p>
      <p className="text-slate-400 text-xs max-w-xs text-center">{error}</p>
      <button onClick={() => window.location.reload()} className="text-sm text-blue-600 hover:underline">Try again</button>
    </div>
  );

  const { stats, recentDailyReports, expiringContracts, vehicleActivity, recentPayments, dukamoStats } = data;
  const totalProjects = stats.projectStats.pending + stats.projectStats.ongoing + stats.projectStats.completed;

  return (
    <div className="space-y-6">
      {/* Pending Reviews Alert */}
      {stats.pendingReviews > 0 && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ClipboardCheck size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">{stats.pendingReviews} report{stats.pendingReviews !== 1 ? 's' : ''} awaiting your review</p>
              <p className="text-xs text-amber-600">Daily reports submitted by supervisors need approval</p>
            </div>
          </div>
          <Link to="/daily-reports" className="text-sm font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
            Review Now →
          </Link>
        </div>
      )}

      {/* Top stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Active Contractors" value={stats.activeContractors} icon={Users} accent="bg-blue-500" />
        <StatCard title="Active Agreements" value={stats.activeAgreements} icon={FileSignature} accent="bg-violet-500" />
        <StatCard title="Contract Value" value={formatCurrency(stats.totalContractValue)} icon={DollarSign} accent="bg-emerald-500" />
        <StatCard title="Pending Payments" value={stats.pendingPayments} sub={formatCurrency(stats.pendingPaymentsAmount)} icon={AlertTriangle} accent={stats.overduePayments > 0 ? 'bg-red-500' : 'bg-orange-500'} />
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-800">Financial Summary</h2>
            <p className="text-xs text-slate-400 mt-0.5">Contractor payment breakdown</p>
          </div>
          <Link to="/payments" className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
            <CreditCard size={13} /> Manage Payments
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Paid Out */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Total Paid Out</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(stats.paidOutTotal)}</p>
            <p className="text-xs text-emerald-500 mt-0.5">{stats.paidOutCount} payment{stats.paidOutCount !== 1 ? 's' : ''} completed</p>
          </div>
          {/* Pending */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(stats.pendingPaymentsAmount)}</p>
            <p className="text-xs text-amber-500 mt-0.5">{stats.pendingPayments} awaiting payment</p>
          </div>
          {/* Overdue */}
          <div className={`${stats.overduePayments > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'} border rounded-xl p-4`}>
            <p className={`text-xs font-medium uppercase tracking-wide ${stats.overduePayments > 0 ? 'text-red-600' : 'text-slate-500'}`}>Overdue</p>
            <p className={`text-2xl font-bold mt-1 ${stats.overduePayments > 0 ? 'text-red-700' : 'text-slate-400'}`}>{stats.overduePayments}</p>
            <p className={`text-xs mt-0.5 ${stats.overduePayments > 0 ? 'text-red-500' : 'text-slate-400'}`}>
              {stats.overduePayments > 0 ? 'Needs attention' : 'All clear'}
            </p>
          </div>
          {/* Total Contract Value */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Contract Value</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(stats.totalContractValue)}</p>
            <p className="text-xs text-blue-500 mt-0.5">{stats.activeAgreements} active agreements</p>
          </div>
        </div>
      </div>

      {/* Dukamo Marketplace Stats */}
      <div className="bg-slate-900 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-400" /> Dukamo Marketplace
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Platform activity overview</p>
          </div>
          <Link to="/dukamo" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Open →</Link>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Workers', value: dukamoStats.workers, icon: Users, color: 'text-blue-400' },
            { label: 'Employers', value: dukamoStats.employers, icon: Briefcase, color: 'text-violet-400' },
            { label: 'Open Jobs', value: dukamoStats.openJobs, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Open Gigs', value: dukamoStats.openGigs, icon: Zap, color: 'text-yellow-400' },
            { label: 'Applications', value: dukamoStats.applications, icon: FileSignature, color: 'text-pink-400' },
            { label: 'Bids', value: dukamoStats.bids, icon: DollarSign, color: 'text-orange-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-800 rounded-xl p-3 text-center">
              <Icon size={16} className={`${color} mx-auto mb-1`} />
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Status + Vehicle Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Board */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Project Status</h2>
            <Link to="/projects" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Pending', count: stats.projectStats.pending, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
              { label: 'Ongoing', count: stats.projectStats.ongoing, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
              { label: 'Completed', count: stats.projectStats.completed, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border ${s.bg} ${s.border} p-4 text-center`}>
                <div className={`w-2.5 h-2.5 rounded-full ${s.dot} mx-auto mb-2`} />
                <p className={`text-2xl font-bold ${s.text}`}>{s.count}</p>
                <p className={`text-xs font-medium ${s.text} mt-0.5`}>{s.label}</p>
              </div>
            ))}
          </div>
          {totalProjects > 0 && (
            <div className="mt-4">
              <div className="flex rounded-full overflow-hidden h-2 bg-slate-100">
                {stats.projectStats.pending > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${(stats.projectStats.pending / totalProjects) * 100}%` }} />}
                {stats.projectStats.ongoing > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${(stats.projectStats.ongoing / totalProjects) * 100}%` }} />}
                {stats.projectStats.completed > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(stats.projectStats.completed / totalProjects) * 100}%` }} />}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 text-right">{totalProjects} total projects</p>
            </div>
          )}
        </div>

        {/* Vehicle Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Vehicle Activity</h2>
            <Truck size={16} className="text-slate-400" />
          </div>
          {vehicleActivity.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">No vehicle reports yet</div>
          ) : (
            <div className="space-y-2.5">
              {vehicleActivity.map((v, i) => {
                const max = vehicleActivity[0].count;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-28 truncate flex-shrink-0">{v.vehicle_type}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(v.count / max) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 w-6 text-right">{v.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Reports + Expiring Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Daily Reports */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Recent Daily Reports</h2>
            <Link to="/daily-reports" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
          </div>
          {recentDailyReports.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No reports yet</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentDailyReports.map(r => (
                <li key={r.id} className="px-5 py-3 flex items-center gap-3">
                  <ReviewDot status={r.review_status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{r.supervisor_name}</p>
                    <p className="text-xs text-slate-400 truncate">{r.vehicle_code ? `${r.vehicle_code} · ` : ''}{r.vehicle_type || '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-slate-600">{formatDate(r.report_date)}</p>
                    <p className={`text-xs ${r.shift === 'day' ? 'text-amber-500' : 'text-indigo-500'}`}>{r.shift} shift</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Expiring Contracts + Recent Payments */}
        <div className="space-y-4">
          {/* Recent Payments */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Recent Payments</h2>
              <Link to="/payments" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
            </div>
            {recentPayments.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm">No payments recorded yet</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentPayments.map((p: any) => (
                  <li key={p.id} className="px-5 py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{p.contractor_name}</p>
                      <p className="text-xs text-slate-400 truncate">{p.milestone_description || p.payment_method}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(p.amount)}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{p.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Expiring Contracts */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Expiring Soon</h2>
              <Link to="/agreements" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
            </div>
            {expiringContracts.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm flex items-center gap-1.5 justify-center">
                <CheckCircle2 size={15} className="text-emerald-400" /> No contracts expiring in 30 days
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {expiringContracts.map(c => (
                  <li key={c.id} className="px-5 py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{c.title}</p>
                      <p className="text-xs text-slate-400">{c.contractor_name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-red-500">Expires {formatDate(c.end_date)}</p>
                      <p className="text-xs text-slate-400">{formatCurrency(c.contract_value)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
