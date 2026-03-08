const express = require('express');
const router = express.Router();
const pool = require('../database');
const { requireAuth } = require('../middleware/auth');

// GET all employers (public)
router.get('/', async (req, res) => {
  try {
    const { industry, location, q } = req.query;
    let query = `
      SELECT ep.*, u.name as owner_name, u.email as owner_email
      FROM employer_profiles ep
      LEFT JOIN users u ON ep.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (industry) { query += ` AND ep.industry = $${idx++}`; params.push(industry); }
    if (location) { query += ` AND ep.location ILIKE $${idx++}`; params.push(`%${location}%`); }
    if (q) {
      query += ` AND (ep.company_name ILIKE $${idx} OR ep.description ILIKE $${idx})`;
      params.push(`%${q}%`); idx++;
    }
    query += ' ORDER BY ep.total_posted DESC, ep.created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single employer
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ep.*, u.name as owner_name
      FROM employer_profiles ep LEFT JOIN users u ON ep.user_id = u.id
      WHERE ep.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Employer not found' });

    const { rows: jobs } = await pool.query(
      `SELECT jp.*, COUNT(ja.id) as application_count FROM job_posts jp
       LEFT JOIN job_applications ja ON jp.id = ja.job_id
       WHERE jp.employer_id = $1 AND jp.status = 'active'
       GROUP BY jp.id ORDER BY jp.created_at DESC`,
      [req.params.id]
    );
    rows[0].jobs = jobs;
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create employer profile
router.post('/', requireAuth, async (req, res) => {
  try {
    const { user_id, company_name, industry, location, website, description } = req.body;
    if (!user_id || !company_name) return res.status(400).json({ error: 'user_id and company_name are required' });
    const { rows } = await pool.query(
      'INSERT INTO employer_profiles (user_id, company_name, industry, location, website, description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [user_id, company_name, industry || null, location || null, website || null, description || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update employer profile
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { company_name, industry, location, website, description } = req.body;
    const { rows } = await pool.query(
      'UPDATE employer_profiles SET company_name=$1, industry=$2, location=$3, website=$4, description=$5 WHERE id=$6 RETURNING *',
      [company_name, industry, location, website, description, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Employer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
