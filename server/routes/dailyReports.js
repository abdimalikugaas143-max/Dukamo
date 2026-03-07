const express = require('express');
const router = express.Router();
const pool = require('../database');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const { shift, supervisor_name, from_date, to_date, project_id, review_status } = req.query;
    let query = `
      SELECT dr.*, p.title as project_title, p.project_code
      FROM daily_reports dr
      LEFT JOIN projects p ON dr.project_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (shift) { query += ` AND dr.shift = $${idx++}`; params.push(shift); }
    if (supervisor_name) { query += ` AND dr.supervisor_name ILIKE $${idx++}`; params.push(`%${supervisor_name}%`); }
    if (from_date) { query += ` AND dr.report_date >= $${idx++}`; params.push(from_date); }
    if (to_date) { query += ` AND dr.report_date <= $${idx++}`; params.push(to_date); }
    if (project_id) { query += ` AND dr.project_id = $${idx++}`; params.push(project_id); }
    if (review_status) { query += ` AND dr.review_status = $${idx++}`; params.push(review_status); }
    query += ' ORDER BY dr.report_date DESC, dr.created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT dr.*, p.title as project_title, p.project_code
      FROM daily_reports dr
      LEFT JOIN projects p ON dr.project_id = p.id
      WHERE dr.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Report not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { report_date, shift, supervisor_name, project_id, vehicle_code, vehicle_type, production_summary, quality_issues, safety_incidents, equipment_status, weather_conditions, notes } = req.body;
    if (!report_date || !supervisor_name) return res.status(400).json({ error: 'report_date and supervisor_name required' });
    const { rows } = await pool.query(
      `INSERT INTO daily_reports (report_date, shift, supervisor_name, supervisor_id, project_id, vehicle_code, vehicle_type, production_summary, quality_issues, safety_incidents, equipment_status, weather_conditions, notes, review_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'submitted') RETURNING *`,
      [report_date, shift || 'day', supervisor_name, req.user.id, project_id || null, vehicle_code || null, vehicle_type || null, production_summary, quality_issues, safety_incidents, equipment_status, weather_conditions, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { report_date, shift, supervisor_name, project_id, vehicle_code, vehicle_type, production_summary, quality_issues, safety_incidents, equipment_status, weather_conditions, notes } = req.body;
    const { rows } = await pool.query(
      `UPDATE daily_reports SET report_date=$1, shift=$2, supervisor_name=$3, project_id=$4, vehicle_code=$5, vehicle_type=$6, production_summary=$7, quality_issues=$8, safety_incidents=$9, equipment_status=$10, weather_conditions=$11, notes=$12
       WHERE id=$13 RETURNING *`,
      [report_date, shift, supervisor_name, project_id || null, vehicle_code || null, vehicle_type || null, production_summary, quality_issues, safety_incidents, equipment_status, weather_conditions, notes, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/review', requireAuth, async (req, res) => {
  try {
    const { review_status, review_notes } = req.body;
    if (!['approved', 'rejected', 'submitted'].includes(review_status)) {
      return res.status(400).json({ error: 'review_status must be approved, rejected, or submitted' });
    }
    const { rows } = await pool.query(
      'UPDATE daily_reports SET review_status=$1, review_notes=$2, reviewed_by=$3, reviewed_at=NOW() WHERE id=$4 RETURNING *',
      [review_status, review_notes || null, req.user.name, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Report not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM daily_reports WHERE id = $1', [req.params.id]);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
