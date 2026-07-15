const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /user/me
router.get('/me', (req, res) => {
  const user = db
    .prepare('SELECT id, email, telegram_chat_id, plan, created_at FROM users WHERE id = ?')
    .get(req.userId);
  res.json({ user });
});

// POST /user/telegram - link telegram chat id (obtained via bot /start command)
router.post('/telegram', (req, res) => {
  const { telegram_chat_id } = req.body;
  if (!telegram_chat_id) {
    return res.status(400).json({ error: 'telegram_chat_id is required' });
  }

  db.prepare('UPDATE users SET telegram_chat_id = ? WHERE id = ?').run(telegram_chat_id, req.userId);
  res.json({ success: true });
});

module.exports = router;
