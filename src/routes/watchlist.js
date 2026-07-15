const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const VALID_INDICATORS = ['price', 'rsi'];
const VALID_DIRECTIONS = ['above', 'below'];
const FREE_PLAN_LIMIT = 3;

// GET /watchlist - list all items for logged-in user
router.get('/', (req, res) => {
  const items = db
    .prepare('SELECT * FROM watchlist_items WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.userId);
  res.json({ items });
});

// POST /watchlist - create new alert
router.post('/', (req, res) => {
  const { symbol, indicator_type = 'price', threshold, direction } = req.body;

  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'symbol is required' });
  }
  if (threshold === undefined || typeof threshold !== 'number') {
    return res.status(400).json({ error: 'threshold must be a number' });
  }
  if (!VALID_INDICATORS.includes(indicator_type)) {
    return res.status(400).json({ error: `indicator_type must be one of: ${VALID_INDICATORS.join(', ')}` });
  }
  if (!VALID_DIRECTIONS.includes(direction)) {
    return res.status(400).json({ error: `direction must be one of: ${VALID_DIRECTIONS.join(', ')}` });
  }

  const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(req.userId);
  if (user.plan === 'free') {
    const count = db
      .prepare('SELECT COUNT(*) as c FROM watchlist_items WHERE user_id = ? AND is_active = 1')
      .get(req.userId).c;
    if (count >= FREE_PLAN_LIMIT) {
      return res.status(403).json({
        error: `Free plan limited to ${FREE_PLAN_LIMIT} active alerts. Upgrade to add more.`
      });
    }
  }

  const cleanSymbol = symbol.trim().toUpperCase();

  const result = db
    .prepare(
      `INSERT INTO watchlist_items (user_id, symbol, indicator_type, threshold, direction)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(req.userId, cleanSymbol, indicator_type, threshold, direction);

  const item = db.prepare('SELECT * FROM watchlist_items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ item });
});

// DELETE /watchlist/:id
router.delete('/:id', (req, res) => {
  const item = db
    .prepare('SELECT * FROM watchlist_items WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  db.prepare('DELETE FROM watchlist_items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// PATCH /watchlist/:id - toggle active/inactive or update threshold
router.patch('/:id', (req, res) => {
  const item = db
    .prepare('SELECT * FROM watchlist_items WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const { threshold, is_active } = req.body;
  const newThreshold = threshold !== undefined ? threshold : item.threshold;
  const newActive = is_active !== undefined ? (is_active ? 1 : 0) : item.is_active;

  db.prepare('UPDATE watchlist_items SET threshold = ?, is_active = ? WHERE id = ?').run(
    newThreshold,
    newActive,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM watchlist_items WHERE id = ?').get(req.params.id);
  res.json({ item: updated });
});

module.exports = router;
