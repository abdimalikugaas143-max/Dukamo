const express = require('express');
const router = express.Router();
const pool = require('../database');

// Supported payment methods by country
const PAYMENT_METHODS = {
  Ethiopia: ['telebirr', 'cbe_birr', 'awash_bank', 'bank_transfer', 'cash'],
  Kenya:    ['mpesa', 'airtel_money', 'bank_transfer', 'cash'],
  Uganda:   ['mtn_momo', 'airtel_money', 'bank_transfer', 'cash'],
  Tanzania: ['mpesa', 'tigopesa', 'airtel_money', 'bank_transfer', 'cash'],
  default:  ['bank_transfer', 'payoneer', 'stripe', 'cash'],
};

// GET payment methods for a country
router.get('/methods/:country', (req, res) => {
  const country = req.params.country;
  res.json({ methods: PAYMENT_METHODS[country] || PAYMENT_METHODS.default });
});

// GET my transactions
router.get('/transactions', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM platform_transactions WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a payment transaction (record a payment)
router.post('/transactions', async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, amount, currency, payment_method, reference, notes } = req.body;
    if (!type || !amount) return res.status(400).json({ error: 'type and amount are required' });

    // Generate reference code if not provided
    const ref = reference || `DUK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { rows } = await pool.query(
      `INSERT INTO platform_transactions (user_id, type, amount, currency, payment_method, reference, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7) RETURNING *`,
      [userId, type, amount, currency || 'ETB', payment_method || 'bank_transfer', ref, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH confirm a payment (admin or self)
router.patch('/transactions/:id/confirm', async (req, res) => {
  try {
    const { rows: existing } = await pool.query(
      `SELECT * FROM platform_transactions WHERE id = $1`, [req.params.id]
    );
    if (!existing.length) return res.status(404).json({ error: 'Transaction not found' });
    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { rows } = await pool.query(
      `UPDATE platform_transactions SET status = 'completed' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET admin: all transactions
router.get('/all', async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { rows } = await pool.query(`
      SELECT pt.*, u.name AS user_name, u.email AS user_email
      FROM platform_transactions pt
      JOIN users u ON u.id = pt.user_id
      ORDER BY pt.created_at DESC LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET admin: revenue summary
router.get('/summary', async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { rows } = await pool.query(`
      SELECT
        type,
        currency,
        SUM(amount) AS total,
        COUNT(*) AS count,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS confirmed_total
      FROM platform_transactions
      GROUP BY type, currency
      ORDER BY confirmed_total DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
