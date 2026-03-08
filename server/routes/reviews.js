const express = require('express');
const router = express.Router();
const pool = require('../database');
const { requireAuth } = require('../middleware/auth');

// GET reviews for a user
router.get('/', async (req, res) => {
  try {
    const { reviewee_id, reviewer_id } = req.query;
    let query = `
      SELECT r.*, u.name as reviewer_name
      FROM reviews r LEFT JOIN users u ON r.reviewer_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (reviewee_id) { query += ` AND r.reviewee_id = $${idx++}`; params.push(reviewee_id); }
    if (reviewer_id) { query += ` AND r.reviewer_id = $${idx++}`; params.push(reviewer_id); }
    query += ' ORDER BY r.created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create review
router.post('/', requireAuth, async (req, res) => {
  try {
    const { reviewer_id, reviewee_id, task_id, job_id, rating, comment } = req.body;
    if (!reviewer_id || !reviewee_id || !rating) {
      return res.status(400).json({ error: 'reviewer_id, reviewee_id, and rating are required' });
    }
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    const { rows } = await pool.query(
      'INSERT INTO reviews (reviewer_id, reviewee_id, task_id, job_id, rating, comment) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [reviewer_id, reviewee_id, task_id || null, job_id || null, rating, comment || null]
    );

    // Update worker's average rating
    await pool.query(`
      UPDATE worker_profiles SET
        rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE reviewee_id = $1),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1)
      WHERE user_id = $1
    `, [reviewee_id]);

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE review
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
