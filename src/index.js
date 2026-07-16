require('dotenv').config();
const express = require('express');

const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlist');
const userRoutes = require('./routes/user');
const webhookRoutes = require('./routes/webhooks');
const configRoutes = require('./routes/config');
const { startPriceChecker } = require('./services/priceChecker');

const app = express();
const PORT = process.env.PORT || 3000;

// Webhook route needs the raw request body to verify the signature, so it's
// mounted BEFORE the global express.json() parser below.
app.use('/webhooks/lemonsqueezy', express.raw({ type: '*/*' }), webhookRoutes);

app.use(express.json());
app.use(express.static(require('path').join(__dirname, '..', 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/watchlist', watchlistRoutes);
app.use('/user', userRoutes);
app.use('/config', configRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Watchtower API running on http://localhost:${PORT}`);
  startPriceChecker();
});
