const express = require('express');
const router = express.Router();
const pool = require('../database');

// GET all contractors
router.get('/', async (req, res) => {
  try {
    const { status, trade, search } = req.query;
    let query = 'SELECT * FROM contractors WHERE 1=1';
    const params = [];
    let idx = 1;

    if (status) { query += ` AND status = $${idx++}`; params.push(status); }
    if (trade) { query += ` AND trade = $${idx++}`; params.push(trade); }
    if (search) {
      query += ` AND (name ILIKE $${idx} OR company_name ILIKE $${idx} OR email ILIKE $${idx})`;
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

// GET single contractor
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM contractors WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Contractor not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create contractor
router.post('/', async (req, res) => {
  try {
    const { name, company_name, trade, phone, email, address, status, notes } = req.body;
    if (!name || !trade) return res.status(400).json({ error: 'Name and trade are required' });

    const { rows } = await pool.query(
      'INSERT INTO contractors (name, company_name, trade, phone, email, address, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, company_name || null, trade, phone || null, email || null, address || null, status || 'active', notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update contractor
router.put('/:id', async (req, res) => {
  try {
    const { name, company_name, trade, phone, email, address, status, notes } = req.body;
    const { rows: existing } = await pool.query('SELECT id FROM contractors WHERE id = $1', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Contractor not found' });

    const { rows } = await pool.query(
      'UPDATE contractors SET name=$1, company_name=$2, trade=$3, phone=$4, email=$5, address=$6, status=$7, notes=$8 WHERE id=$9 RETURNING *',
      [name, company_name, trade, phone, email, address, status, notes, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE contractor
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id FROM contractors WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Contractor not found' });
    await pool.query('DELETE FROM contractors WHERE id = $1', [req.params.id]);
    res.json({ message: 'Contractor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
