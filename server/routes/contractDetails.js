const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all details for an agreement
router.get('/agreement/:agreementId', (req, res) => {
  try {
    const details = db.prepare('SELECT * FROM contract_details WHERE agreement_id = ? ORDER BY id').all(req.params.agreementId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create detail item
router.post('/', (req, res) => {
  try {
    const { agreement_id, item_description, unit, quantity, unit_price, notes } = req.body;
    if (!agreement_id || !item_description) {
      return res.status(400).json({ error: 'agreement_id and item_description are required' });
    }

    const qty = parseFloat(quantity) || 1;
    const price = parseFloat(unit_price) || 0;
    const total = qty * price;

    const result = db.prepare(
      'INSERT INTO contract_details (agreement_id, item_description, unit, quantity, unit_price, total_price, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(agreement_id, item_description, unit, qty, price, total, notes);

    const detail = db.prepare('SELECT * FROM contract_details WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(detail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update detail
router.put('/:id', (req, res) => {
  try {
    const { item_description, unit, quantity, unit_price, notes } = req.body;
    const existing = db.prepare('SELECT * FROM contract_details WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Detail not found' });

    const qty = parseFloat(quantity) || 1;
    const price = parseFloat(unit_price) || 0;
    const total = qty * price;

    db.prepare(
      'UPDATE contract_details SET item_description=?, unit=?, quantity=?, unit_price=?, total_price=?, notes=? WHERE id=?'
    ).run(item_description, unit, qty, price, total, notes, req.params.id);

    const updated = db.prepare('SELECT * FROM contract_details WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE detail
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM contract_details WHERE id = ?').run(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
