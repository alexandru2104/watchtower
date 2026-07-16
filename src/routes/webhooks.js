const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

function verifySignature(rawBody, signatureHeader) {
  if (!WEBHOOK_SECRET) return false;
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest('hex');
  const signature = Buffer.from(signatureHeader || '', 'utf8');
  const expected = Buffer.from(digest, 'utf8');
  return signature.length === expected.length && crypto.timingSafeEqual(signature, expected);
}

// POST /webhooks/lemonsqueezy
// NOTE: this route receives the RAW request body (see index.js), not parsed JSON,
// because the signature must be verified against the exact bytes LemonSqueezy sent.
router.post('/', (req, res) => {
  const signature = req.headers['x-signature'];
  const rawBody = req.body; // Buffer, thanks to express.raw() in index.js

  if (!verifySignature(rawBody, signature)) {
    console.warn('LemonSqueezy webhook: invalid signature, rejecting.');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const eventName = event.meta?.event_name;
  const userId = event.meta?.custom_data?.user_id;

  if (!userId) {
    console.warn(`LemonSqueezy webhook: no user_id in custom_data for event ${eventName}`);
    return res.status(200).json({ received: true });
  }

  switch (eventName) {
    case 'order_created':
    case 'subscription_created':
    case 'subscription_payment_success':
    case 'subscription_resumed':
      db.prepare('UPDATE users SET plan = ? WHERE id = ?').run('premium', userId);
      console.log(`User ${userId} upgraded to premium (${eventName}).`);
      break;

    case 'subscription_cancelled':
    case 'subscription_expired':
    case 'subscription_payment_failed':
      db.prepare('UPDATE users SET plan = ? WHERE id = ?').run('free', userId);
      console.log(`User ${userId} downgraded to free (${eventName}).`);
      break;

    default:
      // Other events (subscription_updated, subscription_paused, etc.) are ignored for now.
      break;
  }

  res.status(200).json({ received: true });
});

module.exports = router;
