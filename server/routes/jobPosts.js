const express = require('express');
const router = express.Router();
const pool = require('../database');
const { requireAuth } = require('../middleware/auth');

// GET all jobs (public, with filters)
router.get('/', async (req, res) => {
  try {
    const { category, job_type, experience_level, location, q, status } = req.query;
    let query = `
      SELECT jp.*, ep.company_name, ep.location as employer_location, ep.verified as employer_verified,
             COUNT(ja.id) as application_count
      FROM job_posts jp
      LEFT JOIN employer_profiles ep ON jp.employer_id = ep.id
      LEFT JOIN job_applications ja ON jp.id = ja.job_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) { query += ` AND jp.status = $${idx++}`; params.push(status); }
    else { query += ` AND jp.status = 'active'`; }
    if (category) { query += ` AND jp.category = $${idx++}`; params.push(category); }
    if (job_type) { query += ` AND jp.job_type = $${idx++}`; params.push(job_type); }
    if (experience_level) { query += ` AND jp.experience_level = $${idx++}`; params.push(experience_level); }
    if (location) { query += ` AND jp.location ILIKE $${idx++}`; params.push(`%${location}%`); }
    if (q) {
      query += ` AND (jp.title ILIKE $${idx} OR jp.description ILIKE $${idx} OR ep.company_name ILIKE $${idx})`;
      params.push(`%${q}%`); idx++;
    }
    query += ' GROUP BY jp.id, ep.company_name, ep.location, ep.verified ORDER BY jp.created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single job
router.get('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE job_posts SET views = views + 1 WHERE id = $1', [req.params.id]);
    const { rows } = await pool.query(`
      SELECT jp.*, ep.company_name, ep.location as employer_location, ep.description as employer_desc,
             ep.website, ep.verified as employer_verified,
             COUNT(ja.id) as application_count
      FROM job_posts jp
      LEFT JOIN employer_profiles ep ON jp.employer_id = ep.id
      LEFT JOIN job_applications ja ON jp.id = ja.job_id
      WHERE jp.id = $1
      GROUP BY jp.id, ep.company_name, ep.location, ep.description, ep.website, ep.verified
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Job not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create job (requires auth)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { employer_id, title, description, category, job_type, location, salary_min, salary_max, currency, skills_required, experience_level, deadline } = req.body;
    if (!employer_id || !title || !description || !category) {
      return res.status(400).json({ error: 'employer_id, title, description, and category are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO job_posts (employer_id, title, description, category, job_type, location, salary_min, salary_max, currency, skills_required, experience_level, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [employer_id, title, description, category, job_type || 'full_time', location, salary_min || null, salary_max || null, currency || 'ETB', skills_required, experience_level || 'entry', deadline || null]
    );
    await pool.query('UPDATE employer_profiles SET total_posted = total_posted + 1 WHERE id = $1', [employer_id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update job (requires auth)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, description, category, job_type, location, salary_min, salary_max, currency, skills_required, experience_level, status, deadline } = req.body;
    const { rows } = await pool.query(
      `UPDATE job_posts SET title=$1, description=$2, category=$3, job_type=$4, location=$5,
       salary_min=$6, salary_max=$7, currency=$8, skills_required=$9, experience_level=$10,
       status=$11, deadline=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [title, description, category, job_type, location, salary_min, salary_max, currency, skills_required, experience_level, status, deadline, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Job not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE job (requires auth)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM job_posts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST apply to a job
router.post('/:id/apply', requireAuth, async (req, res) => {
  try {
    const { worker_id, cover_letter } = req.body;
    if (!worker_id) return res.status(400).json({ error: 'worker_id is required' });
    const { rows } = await pool.query(
      'INSERT INTO job_applications (job_id, worker_id, cover_letter) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, worker_id, cover_letter || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Already applied to this job' });
    res.status(500).json({ error: err.message });
  }
});

// GET applications for a job (employer)
router.get('/:id/applications', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ja.*, wp.bio, wp.skills, wp.experience_years, wp.rating, wp.verified,
             u.name as worker_name, u.email as worker_email
      FROM job_applications ja
      LEFT JOIN worker_profiles wp ON ja.worker_id = wp.id
      LEFT JOIN users u ON wp.user_id = u.id
      WHERE ja.job_id = $1 ORDER BY ja.applied_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
