const express = require('express');
const router = express.Router();
const pool = require('../database');

// GET all agreements (with contractor name joined)
router.get('/', async (req, res) => {
  try {
    const { status, contractor_id, search } = req.query;
    let query = `
      SELECT ca.*, c.name as contractor_name, c.company_name
      FROM contractor_agreements ca
      LEFT JOIN contractors c ON ca.contractor_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) { query += ` AND ca.status = $${idx++}`; params.push(status); }
    if (contractor_id) { query += ` AND ca.contractor_id = $${idx++}`; params.push(contractor_id); }
    if (search) {
      query += ` AND (ca.title ILIKE $${idx} OR ca.agreement_number ILIKE $${idx} OR c.name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    query += ' ORDER BY ca.created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single agreement with details
router.get('/:id', async (req, res) => {
  try {
    const { rows: agreementRows } = await pool.query(`
      SELECT ca.*, c.name as contractor_name, c.company_name, c.phone as contractor_phone, c.email as contractor_email, c.address as contractor_address
      FROM contractor_agreements ca
      LEFT JOIN contractors c ON ca.contractor_id = c.id
      WHERE ca.id = $1
    `, [req.params.id]);

    if (!agreementRows[0]) return res.status(404).json({ error: 'Agreement not found' });

    const { rows: details } = await pool.query('SELECT * FROM contract_details WHERE agreement_id = $1 ORDER BY id', [req.params.id]);
    agreementRows[0].details = details;

    res.json(agreementRows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create agreement
router.post('/', async (req, res) => {
  try {
    const {
      contractor_id, agreement_number, title, scope_of_work,
      start_date, end_date, contract_value, currency,
      payment_terms, status, special_conditions
    } = req.body;

    if (!contractor_id || !agreement_number || !title) {
      return res.status(400).json({ error: 'contractor_id, agreement_number, and title are required' });
    }

    const { rows } = await pool.query(`
      INSERT INTO contractor_agreements
      (contractor_id, agreement_number, title, scope_of_work, start_date, end_date, contract_value, currency, payment_terms, status, special_conditions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [contractor_id, agreement_number, title, scope_of_work, start_date, end_date, contract_value || 0, currency || 'USD', payment_terms, status || 'draft', special_conditions]);

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Agreement number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update agreement
router.put('/:id', async (req, res) => {
  try {
    const {
      contractor_id, agreement_number, title, scope_of_work,
      start_date, end_date, contract_value, currency,
      payment_terms, status, special_conditions
    } = req.body;

    const { rows: existing } = await pool.query('SELECT id FROM contractor_agreements WHERE id = $1', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Agreement not found' });

    const { rows } = await pool.query(`
      UPDATE contractor_agreements SET
      contractor_id=$1, agreement_number=$2, title=$3, scope_of_work=$4,
      start_date=$5, end_date=$6, contract_value=$7, currency=$8,
      payment_terms=$9, status=$10, special_conditions=$11,
      updated_at=NOW()
      WHERE id=$12
      RETURNING *
    `, [contractor_id, agreement_number, title, scope_of_work, start_date, end_date, contract_value, currency, payment_terms, status, special_conditions, req.params.id]);

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE agreement
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id FROM contractor_agreements WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Agreement not found' });
    await pool.query('DELETE FROM contractor_agreements WHERE id = $1', [req.params.id]);
    res.json({ message: 'Agreement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
