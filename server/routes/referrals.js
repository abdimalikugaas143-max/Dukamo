const express = require('express');
const router = express.Router();
const pool = require('../database');

// GET my referral code + stats
router.get('/my', async (req, res) => {
  try {
    const userId = req.user.id;

    // Ensure user has a referral code
    let { rows: [user] } = await pool.query('SELECT referral_code FROM users WHERE id = $1', [userId]);
    if (!user.referral_code) {
      const code = `DUK${userId}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [code, userId]);
      user.referral_code = code;
    }

    const { rows: referrals } = await pool.query(`
      SELECT r.*, u.name AS referred_name, u.email AS referred_email, u.created_at AS joined_at
      FROM referrals r
      JOIN users u ON u.id = r.referred_id
      WHERE r.referrer_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);

    const totalEarned = referrals.filter(r => r.reward_paid).reduce((s, r) => s + r.reward_amount, 0);
    const pending = referrals.filter(r => !r.reward_paid).length;

    res.json({
      referral_code: user.referral_code,
      referral_link: `https://dukamo.com/register?ref=${user.referral_code}`,
      referrals,
      total_referred: referrals.length,
      total_earned: totalEarned,
      pending_rewards: pending,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET leaderboard (top referrers)
router.get('/leaderboard', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.name, u.referral_code, COUNT(r.id) AS total_referrals,
             SUM(CASE WHEN r.reward_paid THEN r.reward_amount ELSE 0 END) AS earned
      FROM referrals r
      JOIN users u ON u.id = r.referrer_id
      GROUP BY u.id, u.name, u.referral_code
      ORDER BY total_referrals DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST admin: mark reward as paid
router.post('/:id/pay', async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { rows } = await pool.query(
      `UPDATE referrals SET reward_paid = true WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Referral not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
