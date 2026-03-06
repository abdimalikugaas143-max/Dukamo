const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM monthly_reports ORDER BY report_month DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM monthly_reports WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Report not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-populate from daily reports
router.get('/aggregate/:month', async (req, res) => {
  try {
    const month = req.params.month; // YYYY-MM
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const { rows } = await pool.query(`
      SELECT
        COUNT(*) as report_count,
        SUM(units_produced) as total_units,
        SUM(attendance_count) as total_attendance
      FROM daily_reports
      WHERE report_date >= $1 AND report_date <= $2
    `, [startDate, endDate]);

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { report_month, prepared_by, total_units_produced, total_contracts_value, active_contractors, production_highlights, challenges, recommendations, financial_summary } = req.body;
    if (!report_month || !prepared_by) return res.status(400).json({ error: 'report_month and prepared_by are required' });

    const { rows } = await pool.query(
      'INSERT INTO monthly_reports (report_month, prepared_by, total_units_produced, total_contracts_value, active_contractors, production_highlights, challenges, recommendations, financial_summary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [report_month, prepared_by, total_units_produced || 0, total_contracts_value || 0, active_contractors || 0, production_highlights, challenges, recommendations, financial_summary]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'A report for this month already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { report_month, prepared_by, total_units_produced, total_contracts_value, active_contractors, production_highlights, challenges, recommendations, financial_summary } = req.body;

    const { rows } = await pool.query(
      'UPDATE monthly_reports SET report_month=$1, prepared_by=$2, total_units_produced=$3, total_contracts_value=$4, active_contractors=$5, production_highlights=$6, challenges=$7, recommendations=$8, financial_summary=$9, updated_at=NOW() WHERE id=$10 RETURNING *',
      [report_month, prepared_by, total_units_produced, total_contracts_value, active_contractors, production_highlights, challenges, recommendations, financial_summary, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM monthly_reports WHERE id = $1', [req.params.id]);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
