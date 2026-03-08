const express = require('express');
const router = express.Router();
const pool = require('../database');
const { requireAuth } = require('../middleware/auth');

// GET bids (filter by worker_id or task_id)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { worker_id, task_id } = req.query;
    let query = `
      SELECT gb.*, gt.title as task_title, gt.budget as task_budget, gt.status as task_status,
             u.name as worker_name, wp.rating
      FROM gig_bids gb
      LEFT JOIN gig_tasks gt ON gb.task_id = gt.id
      LEFT JOIN worker_profiles wp ON gb.worker_id = wp.id
      LEFT JOIN users u ON wp.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (worker_id) { query += ` AND gb.worker_id = $${idx++}`; params.push(worker_id); }
    if (task_id) { query += ` AND gb.task_id = $${idx++}`; params.push(task_id); }
    query += ' ORDER BY gb.created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update bid status
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query(
      'UPDATE gig_bids SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Bid not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE withdraw bid
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM gig_bids WHERE id = $1', [req.params.id]);
    res.json({ message: 'Bid withdrawn' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
