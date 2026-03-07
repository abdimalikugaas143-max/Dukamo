const express = require('express');
const router = express.Router();
const pool = require('../database');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM projects WHERE 1=1';
    const params = [];
    let idx = 1;
    if (status) { query += ` AND status = $${idx++}`; params.push(status); }
    if (search) { query += ` AND (title ILIKE $${idx} OR project_code ILIKE $${idx} OR client_name ILIKE $${idx})`; params.push(`%${search}%`); idx++; }
    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { project_code, title, client_name, description, vehicle_type, status, start_date, end_date, notes } = req.body;
    if (!project_code || !title) return res.status(400).json({ error: 'project_code and title are required' });
    const { rows } = await pool.query(
      'INSERT INTO projects (project_code, title, client_name, description, vehicle_type, status, start_date, end_date, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [project_code, title, client_name, description, vehicle_type, status || 'pending', start_date || null, end_date || null, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Project code already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { project_code, title, client_name, description, vehicle_type, status, start_date, end_date, notes } = req.body;
    const { rows } = await pool.query(
      'UPDATE projects SET project_code=$1, title=$2, client_name=$3, description=$4, vehicle_type=$5, status=$6, start_date=$7, end_date=$8, notes=$9, updated_at=NOW() WHERE id=$10 RETURNING *',
      [project_code, title, client_name, description, vehicle_type, status, start_date || null, end_date || null, notes, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET contractors assigned to a project
router.get('/:id/contractors', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pc.id as assignment_id, pc.role, pc.assigned_at,
              c.id, c.name, c.company_name, c.trade, c.phone, c.email, c.status
       FROM project_contractors pc
       JOIN contractors c ON pc.contractor_id = c.id
       WHERE pc.project_id = $1
       ORDER BY pc.assigned_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST assign a contractor to a project
router.post('/:id/contractors', requireAuth, async (req, res) => {
  try {
    const { contractor_id, role } = req.body;
    if (!contractor_id) return res.status(400).json({ error: 'contractor_id is required' });
    const { rows } = await pool.query(
      'INSERT INTO project_contractors (project_id, contractor_id, role) VALUES ($1, $2, $3) ON CONFLICT (project_id, contractor_id) DO NOTHING RETURNING *',
      [req.params.id, contractor_id, role || null]
    );
    res.status(201).json(rows[0] || { message: 'Already assigned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove a contractor from a project
router.delete('/:id/contractors/:contractorId', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM project_contractors WHERE project_id = $1 AND contractor_id = $2', [req.params.id, req.params.contractorId]);
    res.json({ message: 'Contractor removed from project' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
