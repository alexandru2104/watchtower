# Watchtower - Price Alert Micro-SaaS

Backend MVP: register/login, watchlist alerts (price/RSI), Telegram notifications.

## Setup

```bash
npm install
cp .env.example .env
# edit .env: set JWT_SECRET, optionally TELEGRAM_BOT_TOKEN
node src/index.js
```

Server runs on `http://localhost:3000` (or `PORT` from `.env`).

## Endpoints

- `POST /auth/register` - `{ email, password }` -> `{ token, user }`
- `POST /auth/login` - `{ email, password }` -> `{ token, user }`
- `GET /watchlist` - list alerts (auth required)
- `POST /watchlist` - `{ symbol, indicator_type: "price"|"rsi", threshold, direction: "above"|"below" }`
- `DELETE /watchlist/:id` - remove alert
- `PATCH /watchlist/:id` - `{ threshold?, is_active? }`
- `GET /user/me` - current user info
- `POST /user/telegram` - `{ telegram_chat_id }` - link Telegram for notifications

All `/watchlist` and `/user` routes need `Authorization: Bearer <token>`.

## Next steps (before you launch)

1. **Swap mock price provider** in `src/services/priceProvider.js` for a real API:
   - Crypto: CoinGecko (free, no key needed for basic use)
   - Forex/stocks: Twelve Data or Alpha Vantage (free tier available)
2. **Add RSI calculation** - currently `indicator_type: 'rsi'` is accepted but priceProvider only returns raw price. You'll need historical candle data to compute RSI (14-period is standard).
3. **Set up Telegram bot** - message @BotFather on Telegram, create a bot, get the token, put it in `.env`. Users message your bot `/start` to get their `chat_id`, then POST it to `/user/telegram`.
4. **Add Stripe/LemonSqueezy** for paid plans (free plan is capped at 3 active alerts in the code already - see `FREE_PLAN_LIMIT` in `watchlist.js`).
5. **Rate-limit the cron interval** based on your API's free-tier limits (currently every 1 min in `priceChecker.js`).
6. **Move to Postgres** when you outgrow SQLite (better-sqlite3 -> pg is a moderate refactor since queries are raw SQL).
