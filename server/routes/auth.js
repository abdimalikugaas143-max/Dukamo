const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database');
const { requireAuth, requireAdmin, JWT_SECRET } = require('../middleware/auth');

// Check if setup is needed (no users exist)
router.get('/setup-status', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM users');
    res.json({ needs_setup: parseInt(rows[0].count) === 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initial admin setup (only works if no users exist)
router.post('/setup', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(rows[0].count) > 0) {
      return res.status(400).json({ error: 'Setup already completed. Use login.' });
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const hash = await bcrypt.hash(password, 10);
    const { rows: [user] } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hash, 'admin']
    );
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send verification email via Resend
async function sendVerificationEmail(email, name, code) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // Skip if not configured (dev mode)
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Dukamo <noreply@dukamo.app>',
      to: email,
      subject: 'Your Dukamo verification code',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#059669">Welcome to Dukamo, ${name}!</h2>
          <p style="color:#475569">Your verification code is:</p>
          <div style="font-size:48px;font-weight:bold;letter-spacing:12px;color:#1e293b;margin:24px 0">${code}</div>
          <p style="color:#94a3b8;font-size:14px">This code expires in 15 minutes. Do not share it with anyone.</p>
        </div>
      `,
    }),
  });
}

// Public self-registration for Dukamo workers and employers
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const allowedRoles = ['worker', 'employer'];
    const userRole = allowedRoles.includes(role) ? role : 'worker';
    const hash = await bcrypt.hash(password, 10);
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const { rows: [user] } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, email_verified, verification_code, verification_expires)
       VALUES ($1, $2, $3, $4, false, $5, $6)
       RETURNING id, name, email, role`,
      [name, email.toLowerCase().trim(), hash, userRole, code, expires]
    );
    await sendVerificationEmail(user.email, user.name, code);
    res.status(201).json({ userId: user.id, email: user.email, message: 'Verification code sent to your email' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'An account with this email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Verify email with 6-digit code
router.post('/verify-email', async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ error: 'userId and code required' });
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.email_verified) return res.status(400).json({ error: 'Email already verified' });
    if (user.verification_code !== String(code)) return res.status(400).json({ error: 'Invalid verification code' });
    if (new Date() > new Date(user.verification_expires)) return res.status(400).json({ error: 'Code expired — please request a new one' });
    await pool.query('UPDATE users SET email_verified=true, verification_code=NULL, verification_expires=NULL WHERE id=$1', [userId]);
    const tokenUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(tokenUser, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: tokenUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resend verification code
router.post('/resend-code', async (req, res) => {
  try {
    const { userId } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = rows[0];
    if (!user || user.email_verified) return res.status(400).json({ error: 'Invalid request' });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query('UPDATE users SET verification_code=$1, verification_expires=$2 WHERE id=$3', [code, expires, userId]);
    await sendVerificationEmail(user.email, user.name, code);
    res.json({ message: 'New code sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email.toLowerCase().trim()]);
    if (!rows[0]) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const allowedPublicRoles = ['worker', 'employer'];
    if (allowedPublicRoles.includes(rows[0].role) && !rows[0].email_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in', unverified: true, userId: rows[0].id });
    }
    const user = { id: rows[0].id, name: rows[0].name, email: rows[0].email, role: rows[0].role };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

// --- User Management (Admin only) ---

// List all users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const hash = await bcrypt.hash(password, 10);
    const { rows: [user] } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, is_active, created_at',
      [name, email.toLowerCase().trim(), hash, role || 'supervisor']
    );
    res.status(201).json(user);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, role, is_active, password } = req.body;
    let query, params;
    if (password && password.length >= 6) {
      const hash = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET name=$1, email=$2, role=$3, is_active=$4, password_hash=$5, updated_at=NOW() WHERE id=$6 RETURNING id, name, email, role, is_active';
      params = [name, email.toLowerCase().trim(), role, is_active, hash, req.params.id];
    } else {
      query = 'UPDATE users SET name=$1, email=$2, role=$3, is_active=$4, updated_at=NOW() WHERE id=$5 RETURNING id, name, email, role, is_active';
      params = [name, email.toLowerCase().trim(), role, is_active, req.params.id];
    }
    const { rows: [user] } = await pool.query(query, params);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
