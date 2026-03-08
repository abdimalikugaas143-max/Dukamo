const express = require('express');
const router = express.Router();
const pool = require('../database');
const { requireAuth } = require('../middleware/auth');

// GET applications (optionally filter by worker_id)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { worker_id, job_id } = req.query;
    let query = `
      SELECT ja.*, jp.title as job_title, jp.location as job_location, jp.job_type, jp.salary_min, jp.salary_max,
             ep.company_name, u.name as worker_name
      FROM job_applications ja
      LEFT JOIN job_posts jp ON ja.job_id = jp.id
      LEFT JOIN employer_profiles ep ON jp.employer_id = ep.id
      LEFT JOIN worker_profiles wp ON ja.worker_id = wp.id
      LEFT JOIN users u ON wp.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (worker_id) { query += ` AND ja.worker_id = $${idx++}`; params.push(worker_id); }
    if (job_id) { query += ` AND ja.job_id = $${idx++}`; params.push(job_id); }
    query += ' ORDER BY ja.applied_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update application status
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const { rows } = await pool.query(
      'UPDATE job_applications SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Application not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE withdraw application
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM job_applications WHERE id = $1', [req.params.id]);
    res.json({ message: 'Application withdrawn' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
