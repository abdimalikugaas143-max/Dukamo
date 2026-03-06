const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all contractors
router.get('/', (req, res) => {
  try {
    const { status, trade, search } = req.query;
    let query = 'SELECT * FROM contractors WHERE 1=1';
    const params = [];

    if (status) { query += ' AND status = ?'; params.push(status); }
    if (trade) { query += ' AND trade = ?'; params.push(trade); }
    if (search) {
      query += ' AND (name LIKE ? OR company_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC';

    const contractors = db.prepare(query).all(...params);
    res.json(contractors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single contractor
router.get('/:id', (req, res) => {
  try {
    const contractor = db.prepare('SELECT * FROM contractors WHERE id = ?').get(req.params.id);
    if (!contractor) return res.status(404).json({ error: 'Contractor not found' });
    res.json(contractor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create contractor
router.post('/', (req, res) => {
  try {
    const { name, company_name, trade, phone, email, address, status, notes } = req.body;
    if (!name || !trade) return res.status(400).json({ error: 'Name and trade are required' });

    const result = db.prepare(
      'INSERT INTO contractors (name, company_name, trade, phone, email, address, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, company_name || null, trade, phone || null, email || null, address || null, status || 'active', notes || null);

    const contractor = db.prepare('SELECT * FROM contractors WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(contractor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update contractor
router.put('/:id', (req, res) => {
  try {
    const { name, company_name, trade, phone, email, address, status, notes } = req.body;
    const existing = db.prepare('SELECT * FROM contractors WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Contractor not found' });

    db.prepare(
      'UPDATE contractors SET name=?, company_name=?, trade=?, phone=?, email=?, address=?, status=?, notes=? WHERE id=?'
    ).run(name, company_name, trade, phone, email, address, status, notes, req.params.id);

    const updated = db.prepare('SELECT * FROM contractors WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE contractor
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM contractors WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Contractor not found' });
    db.prepare('DELETE FROM contractors WHERE id = ?').run(req.params.id);
    res.json({ message: 'Contractor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
