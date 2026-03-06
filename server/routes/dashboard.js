const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  try {
    const activeContractors = db.prepare("SELECT COUNT(*) as count FROM contractors WHERE status = 'active'").get();
    const activeAgreements = db.prepare("SELECT COUNT(*) as count FROM contractor_agreements WHERE status = 'active'").get();
    const totalContractValue = db.prepare("SELECT COALESCE(SUM(contract_value), 0) as total FROM contractor_agreements WHERE status IN ('active', 'completed')").get();
    const pendingPayments = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM contractor_payments WHERE status = 'pending'").get();
    const overduePayments = db.prepare("SELECT COUNT(*) as count FROM contractor_payments WHERE status = 'overdue'").get();

    const recentDailyReports = db.prepare(`
      SELECT dr.id, dr.report_date, dr.shift, dr.supervisor_name, dr.units_produced
      FROM daily_reports dr
      ORDER BY dr.report_date DESC, dr.created_at DESC
      LIMIT 5
    `).all();

    const expiringContracts = db.prepare(`
      SELECT ca.id, ca.agreement_number, ca.title, ca.end_date, ca.contract_value, c.name as contractor_name
      FROM contractor_agreements ca
      LEFT JOIN contractors c ON ca.contractor_id = c.id
      WHERE ca.status = 'active'
      AND ca.end_date IS NOT NULL
      AND ca.end_date <= date('now', '+30 days')
      AND ca.end_date >= date('now')
      ORDER BY ca.end_date ASC
      LIMIT 5
    `).all();

    const activePlans = db.prepare("SELECT COUNT(*) as count FROM operational_plans WHERE status = 'active'").get();

    const paymentsByStatus = db.prepare(`
      SELECT status, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
      FROM contractor_payments
      GROUP BY status
    `).all();

    res.json({
      stats: {
        activeContractors: activeContractors.count,
        activeAgreements: activeAgreements.count,
        totalContractValue: totalContractValue.total,
        pendingPayments: pendingPayments.count,
        pendingPaymentsAmount: pendingPayments.total,
        overduePayments: overduePayments.count,
        activePlans: activePlans.count,
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
