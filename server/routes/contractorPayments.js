const express = require('express');
const router = express.Router();
const pool = require('../database');

// GET all payments
router.get('/', async (req, res) => {
  try {
    const { status, contractor_id, agreement_id } = req.query;
    let query = `
      SELECT cp.*, c.name as contractor_name, ca.agreement_number, ca.title as agreement_title
      FROM contractor_payments cp
      LEFT JOIN contractors c ON cp.contractor_id = c.id
      LEFT JOIN contractor_agreements ca ON cp.agreement_id = ca.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) { query += ` AND cp.status = $${idx++}`; params.push(status); }
    if (contractor_id) { query += ` AND cp.contractor_id = $${idx++}`; params.push(contractor_id); }
    if (agreement_id) { query += ` AND cp.agreement_id = $${idx++}`; params.push(agreement_id); }
    query += ' ORDER BY cp.created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single payment
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT cp.*, c.name as contractor_name, ca.agreement_number, ca.title as agreement_title
      FROM contractor_payments cp
      LEFT JOIN contractors c ON cp.contractor_id = c.id
      LEFT JOIN contractor_agreements ca ON cp.agreement_id = ca.id
      WHERE cp.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create payment
router.post('/', async (req, res) => {
  try {
    const { agreement_id, contractor_id, payment_date, amount, payment_method, reference_number, milestone_description, status, notes } = req.body;
    if (!agreement_id || !contractor_id || !amount) {
      return res.status(400).json({ error: 'agreement_id, contractor_id, and amount are required' });
    }

    const { rows } = await pool.query(
      'INSERT INTO contractor_payments (agreement_id, contractor_id, payment_date, amount, payment_method, reference_number, milestone_description, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [agreement_id, contractor_id, payment_date, amount, payment_method || 'bank_transfer', reference_number, milestone_description, status || 'pending', notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update payment
router.put('/:id', async (req, res) => {
  try {
    const { agreement_id, contractor_id, payment_date, amount, payment_method, reference_number, milestone_description, status, notes } = req.body;
    const { rows: existing } = await pool.query('SELECT id FROM contractor_payments WHERE id = $1', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Payment not found' });

    const { rows } = await pool.query(
      'UPDATE contractor_payments SET agreement_id=$1, contractor_id=$2, payment_date=$3, amount=$4, payment_method=$5, reference_number=$6, milestone_description=$7, status=$8, notes=$9 WHERE id=$10 RETURNING *',
      [agreement_id, contractor_id, payment_date, amount, payment_method, reference_number, milestone_description, status, notes, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM contractor_payments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
