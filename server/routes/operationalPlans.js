const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/', async (req, res) => {
  try {
    const { status, plan_type, search } = req.query;
    let query = 'SELECT * FROM operational_plans WHERE 1=1';
    const params = [];
    let idx = 1;

    if (status) { query += ` AND status = $${idx++}`; params.push(status); }
    if (plan_type) { query += ` AND plan_type = $${idx++}`; params.push(plan_type); }
    if (search) {
      query += ` AND (plan_title ILIKE $${idx} OR objectives ILIKE $${idx} OR assigned_team ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM operational_plans WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Plan not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { plan_title, plan_type, start_date, end_date, status, objectives, resources_required, assigned_team, notes } = req.body;
    if (!plan_title) return res.status(400).json({ error: 'plan_title is required' });

    const { rows } = await pool.query(
      'INSERT INTO operational_plans (plan_title, plan_type, start_date, end_date, status, objectives, resources_required, assigned_team, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [plan_title, plan_type || 'production', start_date, end_date, status || 'draft', objectives, resources_required, assigned_team, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { plan_title, plan_type, start_date, end_date, status, objectives, resources_required, assigned_team, notes } = req.body;
    const { rows: existing } = await pool.query('SELECT id FROM operational_plans WHERE id = $1', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Plan not found' });

    const { rows } = await pool.query(
      'UPDATE operational_plans SET plan_title=$1, plan_type=$2, start_date=$3, end_date=$4, status=$5, objectives=$6, resources_required=$7, assigned_team=$8, notes=$9, updated_at=NOW() WHERE id=$10 RETURNING *',
      [plan_title, plan_type, start_date, end_date, status, objectives, resources_required, assigned_team, notes, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM operational_plans WHERE id = $1', [req.params.id]);
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
