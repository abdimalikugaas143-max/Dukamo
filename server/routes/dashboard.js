const express = require('express');
const router = express.Router();
const pool = require('../database');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const [
      { rows: [activeContractors] },
      { rows: [activeAgreements] },
      { rows: [totalContractValue] },
      { rows: [pendingPayments] },
      { rows: [overduePayments] },
      { rows: recentDailyReports },
      { rows: expiringContracts },
      { rows: projectsByStatus },
      { rows: paymentsByStatus },
      { rows: [pendingReviews] },
      { rows: vehicleActivity },
      { rows: [paidOut] },
      { rows: [dukamoRaw] },
      { rows: recentPayments },
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM contractors WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) as count FROM contractor_agreements WHERE status = 'active'"),
      pool.query("SELECT COALESCE(SUM(contract_value), 0) as total FROM contractor_agreements WHERE status IN ('active', 'completed')"),
      pool.query("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM contractor_payments WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) as count FROM contractor_payments WHERE status = 'overdue'"),
      pool.query(`
        SELECT dr.id, dr.report_date, dr.shift, dr.supervisor_name,
               dr.vehicle_code, dr.vehicle_type, dr.review_status,
               p.title as project_title
        FROM daily_reports dr
        LEFT JOIN projects p ON dr.project_id = p.id
        ORDER BY dr.created_at DESC LIMIT 6
      `),
      pool.query(`
        SELECT ca.id, ca.agreement_number, ca.title, ca.end_date, ca.contract_value, c.name as contractor_name
        FROM contractor_agreements ca
        LEFT JOIN contractors c ON ca.contractor_id = c.id
        WHERE ca.status = 'active' AND ca.end_date IS NOT NULL
        AND ca.end_date::date <= NOW() + INTERVAL '30 days'
        AND ca.end_date::date >= NOW()::date
        ORDER BY ca.end_date ASC LIMIT 5
      `),
      pool.query("SELECT status, COUNT(*) as count FROM projects GROUP BY status"),
      pool.query("SELECT status, COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM contractor_payments GROUP BY status"),
      pool.query("SELECT COUNT(*) as count FROM daily_reports WHERE review_status = 'submitted'"),
      pool.query("SELECT vehicle_type, COUNT(*) as count FROM daily_reports WHERE vehicle_type IS NOT NULL GROUP BY vehicle_type ORDER BY count DESC LIMIT 8"),
      // Total paid out to contractors
      pool.query("SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM contractor_payments WHERE status = 'paid'"),
      // Dukamo marketplace counts (safe — returns 0 if tables are empty)
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM users WHERE role = 'worker') as workers,
          (SELECT COUNT(*) FROM users WHERE role = 'employer') as employers,
          (SELECT COUNT(*) FROM job_postings WHERE status = 'open') as open_jobs,
          (SELECT COUNT(*) FROM gig_tasks WHERE status = 'open') as open_gigs,
          (SELECT COUNT(*) FROM job_applications) as applications,
          (SELECT COUNT(*) FROM gig_bids) as bids
      `),
      // 5 most recent payments
      pool.query(`
        SELECT cp.id, cp.amount, cp.status, cp.payment_date, cp.payment_method,
               c.name as contractor_name, cp.milestone_description
        FROM contractor_payments cp
        LEFT JOIN contractors c ON cp.contractor_id = c.id
        ORDER BY cp.created_at DESC LIMIT 5
      `),
    ]);

    const projectStats = { pending: 0, ongoing: 0, completed: 0 };
    projectsByStatus.forEach(p => { if (p.status in projectStats) projectStats[p.status] = parseInt(p.count); });

    res.json({
      stats: {
        activeContractors: parseInt(activeContractors.count),
        activeAgreements: parseInt(activeAgreements.count),
        totalContractValue: parseFloat(totalContractValue.total),
        pendingPayments: parseInt(pendingPayments.count),
        pendingPaymentsAmount: parseFloat(pendingPayments.total),
        overduePayments: parseInt(overduePayments.count),
        pendingReviews: parseInt(pendingReviews.count),
        projectStats,
        paidOutTotal: parseFloat(paidOut.total),
        paidOutCount: parseInt(paidOut.count),
      },
      recentDailyReports,
      expiringContracts,
      paymentsByStatus,
      vehicleActivity,
      recentPayments,
      dukamoStats: {
        workers: parseInt(dukamoRaw.workers || 0),
        employers: parseInt(dukamoRaw.employers || 0),
        openJobs: parseInt(dukamoRaw.open_jobs || 0),
        openGigs: parseInt(dukamoRaw.open_gigs || 0),
        applications: parseInt(dukamoRaw.applications || 0),
        bids: parseInt(dukamoRaw.bids || 0),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
