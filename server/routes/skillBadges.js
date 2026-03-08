const express = require('express');
const router = express.Router();
const pool = require('../database');
const { requireAuth } = require('../middleware/auth');

// GET all badges (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM skill_badges';
    const params = [];
    if (category) { query += ' WHERE category = $1'; params.push(category); }
    query += ' ORDER BY category, name';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create badge (admin)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, category, description, price, icon } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'name and category are required' });
    const { rows } = await pool.query(
      'INSERT INTO skill_badges (name, category, description, price, icon) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, category, description || null, price || 0, icon || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Badge name already exists' });
    res.status(500).json({ error: err.message });
  }
});

// POST award badge to worker
router.post('/award', requireAuth, async (req, res) => {
  try {
    const { worker_id, badge_id } = req.body;
    if (!worker_id || !badge_id) return res.status(400).json({ error: 'worker_id and badge_id are required' });
    const { rows } = await pool.query(
      'INSERT INTO worker_badges (worker_id, badge_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING *',
      [worker_id, badge_id]
    );
    res.status(201).json(rows[0] || { message: 'Badge already awarded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET badges for a specific worker
router.get('/worker/:worker_id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT sb.*, wb.earned_at
      FROM worker_badges wb
      JOIN skill_badges sb ON wb.badge_id = sb.id
      WHERE wb.worker_id = $1 ORDER BY wb.earned_at DESC
    `, [req.params.worker_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE badge
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM skill_badges WHERE id = $1', [req.params.id]);
    res.json({ message: 'Badge deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
