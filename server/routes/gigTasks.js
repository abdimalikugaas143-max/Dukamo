const express = require('express');
const router = express.Router();
const pool = require('../database');
const { requireAuth } = require('../middleware/auth');

// GET all gig tasks (public)
router.get('/', async (req, res) => {
  try {
    const { category, is_remote, status, q } = req.query;
    let query = `
      SELECT gt.*, u.name as poster_name,
             COUNT(gb.id) as bid_count
      FROM gig_tasks gt
      LEFT JOIN users u ON gt.poster_id = u.id
      LEFT JOIN gig_bids gb ON gt.id = gb.task_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) { query += ` AND gt.status = $${idx++}`; params.push(status); }
    else { query += ` AND gt.status = 'open'`; }
    if (category) { query += ` AND gt.category = $${idx++}`; params.push(category); }
    if (is_remote !== undefined) { query += ` AND gt.is_remote = $${idx++}`; params.push(is_remote === 'true'); }
    if (q) {
      query += ` AND (gt.title ILIKE $${idx} OR gt.description ILIKE $${idx})`;
      params.push(`%${q}%`); idx++;
    }
    query += ' GROUP BY gt.id, u.name ORDER BY gt.created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single gig task with bids
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT gt.*, u.name as poster_name,
             COUNT(gb.id) as bid_count
      FROM gig_tasks gt
      LEFT JOIN users u ON gt.poster_id = u.id
      LEFT JOIN gig_bids gb ON gt.id = gb.task_id
      WHERE gt.id = $1
      GROUP BY gt.id, u.name
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Gig task not found' });

    const { rows: bids } = await pool.query(`
      SELECT gb.*, u.name as worker_name, wp.rating, wp.experience_years, wp.verified
      FROM gig_bids gb
      LEFT JOIN worker_profiles wp ON gb.worker_id = wp.id
      LEFT JOIN users u ON wp.user_id = u.id
      WHERE gb.task_id = $1 ORDER BY gb.created_at ASC
    `, [req.params.id]);
    rows[0].bids = bids;
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create gig task (requires auth)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { poster_id, title, description, category, budget, currency, location, is_remote, deadline } = req.body;
    if (!poster_id || !title || !description || !category || !budget) {
      return res.status(400).json({ error: 'poster_id, title, description, category, and budget are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO gig_tasks (poster_id, title, description, category, budget, currency, location, is_remote, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [poster_id, title, description, category, budget, currency || 'ETB', location || null, is_remote || false, deadline || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update gig task
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, description, category, budget, currency, location, is_remote, deadline, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE gig_tasks SET title=$1, description=$2, category=$3, budget=$4, currency=$5,
       location=$6, is_remote=$7, deadline=$8, status=$9, updated_at=NOW() WHERE id=$10 RETURNING *`,
      [title, description, category, budget, currency, location, is_remote, deadline, status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Gig task not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE gig task
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM gig_tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Gig task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit a bid
router.post('/:id/bid', requireAuth, async (req, res) => {
  try {
    const { worker_id, bid_amount, proposal, delivery_days } = req.body;
    if (!worker_id || !bid_amount) return res.status(400).json({ error: 'worker_id and bid_amount are required' });
    const { rows } = await pool.query(
      'INSERT INTO gig_bids (task_id, worker_id, bid_amount, proposal, delivery_days) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.params.id, worker_id, bid_amount, proposal || null, delivery_days || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Already submitted a bid on this task' });
    res.status(500).json({ error: err.message });
  }
});

// PATCH assign a bid (accept bid, assign worker)
router.patch('/:id/assign/:bid_id', requireAuth, async (req, res) => {
  try {
    const { rows: bid } = await pool.query('SELECT * FROM gig_bids WHERE id = $1', [req.params.bid_id]);
    if (!bid[0]) return res.status(404).json({ error: 'Bid not found' });

    await pool.query('UPDATE gig_bids SET status=$1 WHERE task_id=$2 AND id != $3', ['rejected', req.params.id, req.params.bid_id]);
    await pool.query('UPDATE gig_bids SET status=$1 WHERE id=$2', ['accepted', req.params.bid_id]);
    const { rows } = await pool.query(
      'UPDATE gig_tasks SET status=$1, assigned_worker_id=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      ['in_progress', bid[0].worker_id, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark completed
router.patch('/:id/complete', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE gig_tasks SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      ['completed', req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Gig task not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
