const cron = require('node-cron');
const db = require('../db');
const { fetchPrice } = require('./priceProvider');
const { sendTelegramAlert } = require('./notifier');

const PREMIUM_COOLDOWN_MS = 30 * 60 * 1000; // 30 min between re-fires on the same alert

async function checkAllActiveAlerts() {
  const items = db
    .prepare(
      `SELECT wi.*, u.telegram_chat_id, u.plan
       FROM watchlist_items wi
       JOIN users u ON u.id = wi.user_id
       WHERE wi.is_active = 1`
    )
    .all();

  // Group by symbol to avoid redundant API calls
  const symbols = [...new Set(items.map((i) => i.symbol))];
  const prices = {};

  for (const symbol of symbols) {
    try {
      prices[symbol] = await fetchPrice(symbol);
    } catch (err) {
      console.error(`Failed to fetch price for ${symbol}:`, err.message);
    }
  }

  for (const item of items) {
    const currentValue = prices[item.symbol];
    if (currentValue === undefined) continue;

    const triggered =
      item.direction === 'above' ? currentValue >= item.threshold : currentValue <= item.threshold;

    if (!triggered) continue;

    // Premium: alert stays active and can re-fire, but only after a cooldown,
    // so it doesn't ping every single minute while the price sits past the threshold.
    if (item.plan === 'premium') {
      const lastFired = item.last_triggered_at ? new Date(item.last_triggered_at + 'Z').getTime() : 0;
      if (Date.now() - lastFired < PREMIUM_COOLDOWN_MS) continue;
    }

    db.prepare(
      'INSERT INTO alerts_log (watchlist_item_id, value_at_trigger) VALUES (?, ?)'
    ).run(item.id, currentValue);

    if (item.plan === 'premium') {
      // Stays active, just record when it last fired.
      db.prepare("UPDATE watchlist_items SET last_triggered_at = datetime('now') WHERE id = ?").run(item.id);
    } else {
      // Free plan: one-shot. Deactivate so it doesn't spam every cron tick; user recreates it.
      db.prepare("UPDATE watchlist_items SET is_active = 0, last_triggered_at = datetime('now') WHERE id = ?").run(item.id);
    }

    if (item.telegram_chat_id) {
      await sendTelegramAlert(
        item.telegram_chat_id,
        `🔔 ${item.symbol} ${item.direction === 'above' ? 'crossed above' : 'dropped below'} ${item.threshold}. Current: ${currentValue}`
      );
    }
  }
}

function startPriceChecker() {
  // Every minute. Adjust based on API rate limits / plan tier.
  cron.schedule('* * * * *', () => {
    checkAllActiveAlerts().catch((err) => console.error('Price check cycle failed:', err));
  });
  console.log('Price checker cron started (every 1 min).');
}

module.exports = { startPriceChecker, checkAllActiveAlerts };
