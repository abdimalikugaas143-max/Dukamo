const express = require('express');
const router = express.Router();
const pool = require('../database');

// GET inbox — all conversations for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (other_user_id)
        m.id, m.content, m.read, m.created_at, m.job_id, m.gig_id,
        CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END AS other_user_id,
        u.name AS other_user_name, u.role AS other_user_role,
        (SELECT COUNT(*) FROM messages WHERE recipient_id = $1 AND sender_id = u.id AND read = false) AS unread_count
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END
      WHERE m.sender_id = $1 OR m.recipient_id = $1
      ORDER BY other_user_id, m.created_at DESC
    `, [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET conversation with a specific user
router.get('/conversation/:userId', async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = parseInt(req.params.userId);
    const { rows } = await pool.query(`
      SELECT m.*, u.name AS sender_name
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE (m.sender_id = $1 AND m.recipient_id = $2)
         OR (m.sender_id = $2 AND m.recipient_id = $1)
      ORDER BY m.created_at ASC
    `, [myId, otherId]);
    // Mark as read
    await pool.query(
      `UPDATE messages SET read = true WHERE sender_id = $1 AND recipient_id = $2 AND read = false`,
      [otherId, myId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST send a message
router.post('/', async (req, res) => {
  try {
    const senderId = req.user.id;
    const { recipient_id, content, job_id, gig_id } = req.body;
    if (!recipient_id || !content?.trim()) {
      return res.status(400).json({ error: 'recipient_id and content are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, content, job_id, gig_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [senderId, recipient_id, content.trim(), job_id || null, gig_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET unread count
router.get('/unread', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS count FROM messages WHERE recipient_id = $1 AND read = false`,
      [req.user.id]
    );
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
