require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlist');
const userRoutes = require('./routes/user');
const webhookRoutes = require('./routes/webhooks');
const configRoutes = require('./routes/config');
const { startPriceChecker } = require('./services/priceChecker');

const app = express();
const PORT = process.env.PORT || 3000;

// Railway (and most hosts) sit behind a reverse proxy — this makes req.ip and
// rate limiting see the real client IP instead of the proxy's.
app.set('trust proxy', 1);

// Security headers. CSP is disabled because the frontend uses inline
// <script>/<style> tags; if you later split those into external files,
// turning CSP back on with a proper policy is worth doing.
app.use(helmet({ contentSecurityPolicy: false }));

// Webhook route needs the raw request body to verify the signature, so it's
// mounted BEFORE the global express.json() parser below.
app.use('/webhooks/lemonsqueezy', express.raw({ type: '*/*' }), webhookRoutes);

app.use(express.json());
app.use(express.static(require('path').join(__dirname, '..', 'public')));

// Stricter limit on auth endpoints — this is what brute-force/credential
// stuffing attempts target, so it gets a tighter budget than the rest of the API.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' }
});

// Looser general limit for the rest of the API, mostly to blunt abuse/scraping.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authLimiter, authRoutes);
app.use('/watchlist', apiLimiter, watchlistRoutes);
app.use('/user', apiLimiter, userRoutes);
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
