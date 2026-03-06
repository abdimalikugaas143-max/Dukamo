import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileSignature, DollarSign, AlertTriangle, ClipboardList, TrendingUp, ClipboardCheck } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { DashboardData } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

function ReviewStatusDot({ status }: { status: string }) {
  if (status === 'approved') return <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />;
  if (status === 'rejected') return <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />;
  return <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />;
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return <div className="text-slate-500">Failed to load dashboard data.</div>;

  const { stats, recentDailyReports, expiringContracts, paymentsByStatus } = data;

  return (
    <div className="space-y-6">
      {/* Pending Reviews Alert */}
      {stats.pendingReviews > 0 && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {stats.pendingReviews} report{stats.pendingReviews !== 1 ? 's' : ''} awaiting your review
              </p>
              <p className="text-xs text-amber-600">Supervisor daily reports need manager approval</p>
            </div>
          </div>
          <Link
            to="/daily-reports"
            className="text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-colors"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Active Contractors"
          value={stats.activeContractors}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Agreements"
          value={stats.activeAgreements}
          icon={FileSignature}
          color="green"
        />
        <StatCard
          title="Total Contract Value"
          value={formatCurrency(stats.totalContractValue)}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={AlertTriangle}
          color={stats.overduePayments > 0 ? 'red' : 'orange'}
          subtitle={formatCurrency(stats.pendingPaymentsAmount)}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Active Plans"
          value={stats.activePlans}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Reports Pending Review"
          value={stats.pendingReviews}
          icon={ClipboardCheck}
          color={stats.pendingReviews > 0 ? 'orange' : 'green'}
        />
        <StatCard
          title="Overdue Payments"
          value={stats.overduePayments}
          icon={AlertTriangle}
          color={stats.overduePayments > 0 ? 'red' : 'green'}
        />
        {paymentsByStatus.slice(0, 1).map(p => (
          <StatCard
            key={p.status}
            title={`${p.status.charAt(0).toUpperCase() + p.status.slice(1)} Payment Total`}
            value={formatCurrency(p.total)}
            icon={TrendingUp}
            color={p.status === 'paid' ? 'green' : p.status === 'overdue' ? 'red' : 'orange'}
            subtitle={`${p.count} payment${p.count !== 1 ? 's' : ''}`}
          />
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Daily Reports */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Recent Daily Reports</h2>
            <Link to="/daily-reports" className="text-xs text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          {recentDailyReports.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No reports yet</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentDailyReports.map(r => (
                <li key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ReviewStatusDot status={r.review_status || 'submitted'} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{formatDate(r.report_date)}</p>
                      <p className="text-xs text-slate-500">{r.supervisor_name} &bull; {r.shift} shift</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-800">{r.units_produced} units</p>
                    <StatusBadge status={r.shift} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Expiring Contracts */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Contracts Expiring Soon</h2>
            <Link to="/agreements" className="text-xs text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          {expiringContracts.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No contracts expiring in 30 days</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {expiringContracts.map(c => (
                <li key={c.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.agreement_number} &bull; {c.contractor_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-red-600">Expires {formatDate(c.end_date!)}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(c.contract_value)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
