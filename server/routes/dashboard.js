const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/', async (req, res) => {
  try {
    const [
      { rows: [activeContractors] },
      { rows: [activeAgreements] },
      { rows: [totalContractValue] },
      { rows: [pendingPayments] },
      { rows: [overduePayments] },
      { rows: recentDailyReports },
      { rows: expiringContracts },
      { rows: [activePlans] },
      { rows: paymentsByStatus },
      { rows: [pendingReviews] },
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM contractors WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) as count FROM contractor_agreements WHERE status = 'active'"),
      pool.query("SELECT COALESCE(SUM(contract_value), 0) as total FROM contractor_agreements WHERE status IN ('active', 'completed')"),
      pool.query("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM contractor_payments WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) as count FROM contractor_payments WHERE status = 'overdue'"),
      pool.query(`
        SELECT dr.id, dr.report_date, dr.shift, dr.supervisor_name, dr.units_produced, dr.review_status
        FROM daily_reports dr
        ORDER BY dr.report_date DESC, dr.created_at DESC
        LIMIT 5
      `),
      pool.query(`
        SELECT ca.id, ca.agreement_number, ca.title, ca.end_date, ca.contract_value, c.name as contractor_name
        FROM contractor_agreements ca
        LEFT JOIN contractors c ON ca.contractor_id = c.id
        WHERE ca.status = 'active'
        AND ca.end_date IS NOT NULL
        AND ca.end_date::date <= NOW() + INTERVAL '30 days'
        AND ca.end_date::date >= NOW()::date
        ORDER BY ca.end_date ASC
        LIMIT 5
      `),
      pool.query("SELECT COUNT(*) as count FROM operational_plans WHERE status = 'active'"),
      pool.query(`
        SELECT status, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
        FROM contractor_payments
        GROUP BY status
      `),
      pool.query("SELECT COUNT(*) as count FROM daily_reports WHERE review_status = 'submitted'"),
    ]);

    res.json({
      stats: {
        activeContractors: parseInt(activeContractors.count),
        activeAgreements: parseInt(activeAgreements.count),
        totalContractValue: parseFloat(totalContractValue.total),
        pendingPayments: parseInt(pendingPayments.count),
        pendingPaymentsAmount: parseFloat(pendingPayments.total),
        overduePayments: parseInt(overduePayments.count),
        activePlans: parseInt(activePlans.count),
        pendingReviews: parseInt(pendingReviews.count),
      },
      recentDailyReports,
      expiringContracts,
      paymentsByStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
