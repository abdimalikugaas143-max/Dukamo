const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  try {
    const { shift, supervisor_name, from_date, to_date, operational_plan_id } = req.query;
    let query = `
      SELECT dr.*, op.plan_title as plan_title
      FROM daily_reports dr
      LEFT JOIN operational_plans op ON dr.operational_plan_id = op.id
      WHERE 1=1
    `;
    const params = [];

    if (shift) { query += ' AND dr.shift = ?'; params.push(shift); }
    if (supervisor_name) { query += ' AND dr.supervisor_name LIKE ?'; params.push(`%${supervisor_name}%`); }
    if (from_date) { query += ' AND dr.report_date >= ?'; params.push(from_date); }
    if (to_date) { query += ' AND dr.report_date <= ?'; params.push(to_date); }
    if (operational_plan_id) { query += ' AND dr.operational_plan_id = ?'; params.push(operational_plan_id); }
    query += ' ORDER BY dr.report_date DESC, dr.created_at DESC';

    res.json(db.prepare(query).all(...params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const report = db.prepare(`
      SELECT dr.*, op.plan_title
      FROM daily_reports dr
      LEFT JOIN operational_plans op ON dr.operational_plan_id = op.id
      WHERE dr.id = ?
    `).get(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { report_date, shift, supervisor_name, production_summary, units_produced, quality_issues, safety_incidents, equipment_status, weather_conditions, attendance_count, notes, operational_plan_id } = req.body;
    if (!report_date || !supervisor_name) return res.status(400).json({ error: 'report_date and supervisor_name are required' });

    const result = db.prepare(
      'INSERT INTO daily_reports (report_date, shift, supervisor_name, production_summary, units_produced, quality_issues, safety_incidents, equipment_status, weather_conditions, attendance_count, notes, operational_plan_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(report_date, shift || 'day', supervisor_name, production_summary, units_produced || 0, quality_issues, safety_incidents, equipment_status, weather_conditions, attendance_count || 0, notes, operational_plan_id || null);

    res.status(201).json(db.prepare('SELECT * FROM daily_reports WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { report_date, shift, supervisor_name, production_summary, units_produced, quality_issues, safety_incidents, equipment_status, weather_conditions, attendance_count, notes, operational_plan_id } = req.body;

    db.prepare(
      'UPDATE daily_reports SET report_date=?, shift=?, supervisor_name=?, production_summary=?, units_produced=?, quality_issues=?, safety_incidents=?, equipment_status=?, weather_conditions=?, attendance_count=?, notes=?, operational_plan_id=? WHERE id=?'
    ).run(report_date, shift, supervisor_name, production_summary, units_produced, quality_issues, safety_incidents, equipment_status, weather_conditions, attendance_count, notes, operational_plan_id || null, req.params.id);

    res.json(db.prepare('SELECT * FROM daily_reports WHERE id = ?').get(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM daily_reports WHERE id = ?').run(req.params.id);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
