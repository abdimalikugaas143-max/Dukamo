const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  try {
    const { status, plan_type, search } = req.query;
    let query = 'SELECT * FROM operational_plans WHERE 1=1';
    const params = [];

    if (status) { query += ' AND status = ?'; params.push(status); }
    if (plan_type) { query += ' AND plan_type = ?'; params.push(plan_type); }
    if (search) {
      query += ' AND (plan_title LIKE ? OR objectives LIKE ? OR assigned_team LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC';

    res.json(db.prepare(query).all(...params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const plan = db.prepare('SELECT * FROM operational_plans WHERE id = ?').get(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { plan_title, plan_type, start_date, end_date, status, objectives, resources_required, assigned_team, notes } = req.body;
    if (!plan_title) return res.status(400).json({ error: 'plan_title is required' });

    const result = db.prepare(
      'INSERT INTO operational_plans (plan_title, plan_type, start_date, end_date, status, objectives, resources_required, assigned_team, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(plan_title, plan_type || 'production', start_date, end_date, status || 'draft', objectives, resources_required, assigned_team, notes);

    res.status(201).json(db.prepare('SELECT * FROM operational_plans WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { plan_title, plan_type, start_date, end_date, status, objectives, resources_required, assigned_team, notes } = req.body;
    const existing = db.prepare('SELECT id FROM operational_plans WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Plan not found' });

    db.prepare(
      `UPDATE operational_plans SET plan_title=?, plan_type=?, start_date=?, end_date=?, status=?, objectives=?, resources_required=?, assigned_team=?, notes=?, updated_at=datetime('now') WHERE id=?`
    ).run(plan_title, plan_type, start_date, end_date, status, objectives, resources_required, assigned_team, notes, req.params.id);

    res.json(db.prepare('SELECT * FROM operational_plans WHERE id = ?').get(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM operational_plans WHERE id = ?').run(req.params.id);
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
