const express = require('express');
const router = express.Router();
const pool = require('../database');

// GET all details for an agreement
router.get('/agreement/:agreementId', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM contract_details WHERE agreement_id = $1 ORDER BY id', [req.params.agreementId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create detail item
router.post('/', async (req, res) => {
  try {
    const { agreement_id, item_description, unit, quantity, unit_price, notes } = req.body;
    if (!agreement_id || !item_description) {
      return res.status(400).json({ error: 'agreement_id and item_description are required' });
    }

    const qty = parseFloat(quantity) || 1;
    const price = parseFloat(unit_price) || 0;
    const total = qty * price;

    const { rows } = await pool.query(
      'INSERT INTO contract_details (agreement_id, item_description, unit, quantity, unit_price, total_price, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [agreement_id, item_description, unit, qty, price, total, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update detail
router.put('/:id', async (req, res) => {
  try {
    const { item_description, unit, quantity, unit_price, notes } = req.body;
    const { rows: existing } = await pool.query('SELECT id FROM contract_details WHERE id = $1', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Detail not found' });

    const qty = parseFloat(quantity) || 1;
    const price = parseFloat(unit_price) || 0;
    const total = qty * price;

    const { rows } = await pool.query(
      'UPDATE contract_details SET item_description=$1, unit=$2, quantity=$3, unit_price=$4, total_price=$5, notes=$6 WHERE id=$7 RETURNING *',
      [item_description, unit, qty, price, total, notes, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE detail
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM contract_details WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
