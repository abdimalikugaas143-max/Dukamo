const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all agreements (with contractor name joined)
router.get('/', (req, res) => {
  try {
    const { status, contractor_id, search } = req.query;
    let query = `
      SELECT ca.*, c.name as contractor_name, c.company_name
      FROM contractor_agreements ca
      LEFT JOIN contractors c ON ca.contractor_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) { query += ' AND ca.status = ?'; params.push(status); }
    if (contractor_id) { query += ' AND ca.contractor_id = ?'; params.push(contractor_id); }
    if (search) {
      query += ' AND (ca.title LIKE ? OR ca.agreement_number LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY ca.created_at DESC';

    const agreements = db.prepare(query).all(...params);
    res.json(agreements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single agreement with details
router.get('/:id', (req, res) => {
  try {
    const agreement = db.prepare(`
      SELECT ca.*, c.name as contractor_name, c.company_name, c.phone as contractor_phone, c.email as contractor_email, c.address as contractor_address
      FROM contractor_agreements ca
      LEFT JOIN contractors c ON ca.contractor_id = c.id
      WHERE ca.id = ?
    `).get(req.params.id);

    if (!agreement) return res.status(404).json({ error: 'Agreement not found' });

    const details = db.prepare('SELECT * FROM contract_details WHERE agreement_id = ? ORDER BY id').all(req.params.id);
    agreement.details = details;

    res.json(agreement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create agreement
router.post('/', (req, res) => {
  try {
    const {
      contractor_id, agreement_number, title, scope_of_work,
      start_date, end_date, contract_value, currency,
      payment_terms, status, special_conditions
    } = req.body;

    if (!contractor_id || !agreement_number || !title) {
      return res.status(400).json({ error: 'contractor_id, agreement_number, and title are required' });
    }

    const result = db.prepare(`
      INSERT INTO contractor_agreements
      (contractor_id, agreement_number, title, scope_of_work, start_date, end_date, contract_value, currency, payment_terms, status, special_conditions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(contractor_id, agreement_number, title, scope_of_work, start_date, end_date, contract_value || 0, currency || 'USD', payment_terms, status || 'draft', special_conditions);

    const agreement = db.prepare('SELECT * FROM contractor_agreements WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(agreement);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Agreement number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update agreement
router.put('/:id', (req, res) => {
  try {
    const {
      contractor_id, agreement_number, title, scope_of_work,
      start_date, end_date, contract_value, currency,
      payment_terms, status, special_conditions
    } = req.body;

    const existing = db.prepare('SELECT * FROM contractor_agreements WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Agreement not found' });

    db.prepare(`
      UPDATE contractor_agreements SET
      contractor_id=?, agreement_number=?, title=?, scope_of_work=?,
      start_date=?, end_date=?, contract_value=?, currency=?,
      payment_terms=?, status=?, special_conditions=?,
      updated_at=datetime('now')
      WHERE id=?
    `).run(contractor_id, agreement_number, title, scope_of_work, start_date, end_date, contract_value, currency, payment_terms, status, special_conditions, req.params.id);

    const updated = db.prepare('SELECT * FROM contractor_agreements WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE agreement
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM contractor_agreements WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Agreement not found' });
    db.prepare('DELETE FROM contractor_agreements WHERE id = ?').run(req.params.id);
    res.json({ message: 'Agreement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
