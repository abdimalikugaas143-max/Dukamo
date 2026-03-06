const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/', async (req, res) => {
  try {
    const { shift, supervisor_name, from_date, to_date, operational_plan_id, review_status } = req.query;
    let query = `
      SELECT dr.*, op.plan_title as plan_title
      FROM daily_reports dr
      LEFT JOIN operational_plans op ON dr.operational_plan_id = op.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (shift) { query += ` AND dr.shift = $${idx++}`; params.push(shift); }
    if (supervisor_name) { query += ` AND dr.supervisor_name ILIKE $${idx++}`; params.push(`%${supervisor_name}%`); }
    if (from_date) { query += ` AND dr.report_date >= $${idx++}`; params.push(from_date); }
    if (to_date) { query += ` AND dr.report_date <= $${idx++}`; params.push(to_date); }
    if (operational_plan_id) { query += ` AND dr.operational_plan_id = $${idx++}`; params.push(operational_plan_id); }
    if (review_status) { query += ` AND dr.review_status = $${idx++}`; params.push(review_status); }
    query += ' ORDER BY dr.report_date DESC, dr.created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT dr.*, op.plan_title
      FROM daily_reports dr
      LEFT JOIN operational_plans op ON dr.operational_plan_id = op.id
      WHERE dr.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Report not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { report_date, shift, supervisor_name, production_summary, units_produced, quality_issues, safety_incidents, equipment_status, weather_conditions, attendance_count, notes, operational_plan_id } = req.body;
    if (!report_date || !supervisor_name) return res.status(400).json({ error: 'report_date and supervisor_name are required' });

    const { rows } = await pool.query(
      'INSERT INTO daily_reports (report_date, shift, supervisor_name, production_summary, units_produced, quality_issues, safety_incidents, equipment_status, weather_conditions, attendance_count, notes, operational_plan_id, review_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [report_date, shift || 'day', supervisor_name, production_summary, units_produced || 0, quality_issues, safety_incidents, equipment_status, weather_conditions, attendance_count || 0, notes, operational_plan_id || null, 'submitted']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { report_date, shift, supervisor_name, production_summary, units_produced, quality_issues, safety_incidents, equipment_status, weather_conditions, attendance_count, notes, operational_plan_id } = req.body;

    const { rows } = await pool.query(
      'UPDATE daily_reports SET report_date=$1, shift=$2, supervisor_name=$3, production_summary=$4, units_produced=$5, quality_issues=$6, safety_incidents=$7, equipment_status=$8, weather_conditions=$9, attendance_count=$10, notes=$11, operational_plan_id=$12 WHERE id=$13 RETURNING *',
      [report_date, shift, supervisor_name, production_summary, units_produced, quality_issues, safety_incidents, equipment_status, weather_conditions, attendance_count, notes, operational_plan_id || null, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manager review endpoint: PATCH /api/daily-reports/:id/review
router.patch('/:id/review', async (req, res) => {
  try {
    const { review_status, review_notes, reviewed_by } = req.body;
    if (!['approved', 'rejected', 'submitted'].includes(review_status)) {
      return res.status(400).json({ error: 'review_status must be approved, rejected, or submitted' });
    }
    const { rows } = await pool.query(
      'UPDATE daily_reports SET review_status=$1, review_notes=$2, reviewed_by=$3, reviewed_at=NOW() WHERE id=$4 RETURNING *',
      [review_status, review_notes || null, reviewed_by || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Report not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM daily_reports WHERE id = $1', [req.params.id]);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
