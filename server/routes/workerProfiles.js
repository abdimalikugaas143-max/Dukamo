const express = require('express');
const router = express.Router();
const pool = require('../database');
const { requireAuth } = require('../middleware/auth');

// GET all worker profiles (public)
router.get('/', async (req, res) => {
  try {
    const { skills, location, availability, q } = req.query;
    let query = `
      SELECT wp.*, u.name, u.email
      FROM worker_profiles wp
      LEFT JOIN users u ON wp.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (availability) { query += ` AND wp.availability = $${idx++}`; params.push(availability); }
    if (location) { query += ` AND wp.location ILIKE $${idx++}`; params.push(`%${location}%`); }
    if (skills) { query += ` AND wp.skills ILIKE $${idx++}`; params.push(`%${skills}%`); }
    if (q) {
      query += ` AND (u.name ILIKE $${idx} OR wp.skills ILIKE $${idx} OR wp.bio ILIKE $${idx})`;
      params.push(`%${q}%`); idx++;
    }
    query += ' ORDER BY wp.rating DESC, wp.created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single worker profile (public)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT wp.*, u.name, u.email
      FROM worker_profiles wp
      LEFT JOIN users u ON wp.user_id = u.id
      WHERE wp.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Worker profile not found' });

    const { rows: badges } = await pool.query(`
      SELECT sb.name, sb.category, sb.icon, wb.earned_at
      FROM worker_badges wb
      JOIN skill_badges sb ON wb.badge_id = sb.id
      WHERE wb.worker_id = $1
    `, [req.params.id]);
    rows[0].badges = badges;

    const { rows: reviews } = await pool.query(`
      SELECT r.*, u.name as reviewer_name
      FROM reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      WHERE r.reviewee_id = (SELECT user_id FROM worker_profiles WHERE id = $1)
      ORDER BY r.created_at DESC LIMIT 5
    `, [req.params.id]);
    rows[0].reviews = reviews;

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create worker profile
router.post('/', requireAuth, async (req, res) => {
  try {
    const { user_id, bio, location, skills, experience_years, hourly_rate, availability, portfolio_url } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id is required' });
    const { rows } = await pool.query(
      `INSERT INTO worker_profiles (user_id, bio, location, skills, experience_years, hourly_rate, availability, portfolio_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [user_id, bio, location, skills, experience_years || 0, hourly_rate || null, availability || 'available', portfolio_url || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update worker profile
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { bio, location, skills, experience_years, hourly_rate, availability, portfolio_url } = req.body;
    const { rows } = await pool.query(
      `UPDATE worker_profiles SET bio=$1, location=$2, skills=$3, experience_years=$4,
       hourly_rate=$5, availability=$6, portfolio_url=$7 WHERE id=$8 RETURNING *`,
      [bio, location, skills, experience_years, hourly_rate, availability, portfolio_url, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Worker profile not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET worker's applications
router.get('/:id/applications', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ja.*, jp.title as job_title, jp.job_type, jp.salary_min, jp.salary_max,
             ep.company_name, jp.location as job_location
      FROM job_applications ja
      LEFT JOIN job_posts jp ON ja.job_id = jp.id
      LEFT JOIN employer_profiles ep ON jp.employer_id = ep.id
      WHERE ja.worker_id = $1 ORDER BY ja.applied_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET worker's bids
router.get('/:id/bids', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT gb.*, gt.title as task_title, gt.budget as task_budget, gt.status as task_status, gt.category
      FROM gig_bids gb
      LEFT JOIN gig_tasks gt ON gb.task_id = gt.id
      WHERE gb.worker_id = $1 ORDER BY gb.created_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
