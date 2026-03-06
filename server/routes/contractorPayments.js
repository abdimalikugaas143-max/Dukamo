const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all payments
router.get('/', (req, res) => {
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

    if (status) { query += ' AND cp.status = ?'; params.push(status); }
    if (contractor_id) { query += ' AND cp.contractor_id = ?'; params.push(contractor_id); }
    if (agreement_id) { query += ' AND cp.agreement_id = ?'; params.push(agreement_id); }
    query += ' ORDER BY cp.created_at DESC';

    const payments = db.prepare(query).all(...params);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single payment
router.get('/:id', (req, res) => {
  try {
    const payment = db.prepare(`
      SELECT cp.*, c.name as contractor_name, ca.agreement_number, ca.title as agreement_title
      FROM contractor_payments cp
      LEFT JOIN contractors c ON cp.contractor_id = c.id
      LEFT JOIN contractor_agreements ca ON cp.agreement_id = ca.id
      WHERE cp.id = ?
    `).get(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create payment
router.post('/', (req, res) => {
  try {
    const { agreement_id, contractor_id, payment_date, amount, payment_method, reference_number, milestone_description, status, notes } = req.body;
    if (!agreement_id || !contractor_id || !amount) {
      return res.status(400).json({ error: 'agreement_id, contractor_id, and amount are required' });
    }

    const result = db.prepare(
      'INSERT INTO contractor_payments (agreement_id, contractor_id, payment_date, amount, payment_method, reference_number, milestone_description, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(agreement_id, contractor_id, payment_date, amount, payment_method || 'bank_transfer', reference_number, milestone_description, status || 'pending', notes);

    const payment = db.prepare('SELECT * FROM contractor_payments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update payment
router.put('/:id', (req, res) => {
  try {
    const { agreement_id, contractor_id, payment_date, amount, payment_method, reference_number, milestone_description, status, notes } = req.body;
    const existing = db.prepare('SELECT * FROM contractor_payments WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Payment not found' });

    db.prepare(
      'UPDATE contractor_payments SET agreement_id=?, contractor_id=?, payment_date=?, amount=?, payment_method=?, reference_number=?, milestone_description=?, status=?, notes=? WHERE id=?'
    ).run(agreement_id, contractor_id, payment_date, amount, payment_method, reference_number, milestone_description, status, notes, req.params.id);

    const updated = db.prepare('SELECT * FROM contractor_payments WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE payment
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM contractor_payments WHERE id = ?').run(req.params.id);
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
