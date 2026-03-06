const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM monthly_reports ORDER BY report_month DESC').all());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const report = db.prepare('SELECT * FROM monthly_reports WHERE id = ?').get(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-populate from daily reports
router.get('/aggregate/:month', (req, res) => {
  try {
    const month = req.params.month; // YYYY-MM
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const aggregated = db.prepare(`
      SELECT
        COUNT(*) as report_count,
        SUM(units_produced) as total_units,
        SUM(attendance_count) as total_attendance
      FROM daily_reports
      WHERE report_date >= ? AND report_date <= ?
    `).get(startDate, endDate);

    res.json(aggregated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { report_month, prepared_by, total_units_produced, total_contracts_value, active_contractors, production_highlights, challenges, recommendations, financial_summary } = req.body;
    if (!report_month || !prepared_by) return res.status(400).json({ error: 'report_month and prepared_by are required' });

    const result = db.prepare(
      'INSERT INTO monthly_reports (report_month, prepared_by, total_units_produced, total_contracts_value, active_contractors, production_highlights, challenges, recommendations, financial_summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(report_month, prepared_by, total_units_produced || 0, total_contracts_value || 0, active_contractors || 0, production_highlights, challenges, recommendations, financial_summary);

    res.status(201).json(db.prepare('SELECT * FROM monthly_reports WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'A report for this month already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { report_month, prepared_by, total_units_produced, total_contracts_value, active_contractors, production_highlights, challenges, recommendations, financial_summary } = req.body;

    db.prepare(
      `UPDATE monthly_reports SET report_month=?, prepared_by=?, total_units_produced=?, total_contracts_value=?, active_contractors=?, production_highlights=?, challenges=?, recommendations=?, financial_summary=?, updated_at=datetime('now') WHERE id=?`
    ).run(report_month, prepared_by, total_units_produced, total_contracts_value, active_contractors, production_highlights, challenges, recommendations, financial_summary, req.params.id);

    res.json(db.prepare('SELECT * FROM monthly_reports WHERE id = ?').get(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM monthly_reports WHERE id = ?').run(req.params.id);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
