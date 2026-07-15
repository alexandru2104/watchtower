require('dotenv').config();
const express = require('express');

const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlist');
const userRoutes = require('./routes/user');
const { startPriceChecker } = require('./services/priceChecker');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(require('path').join(__dirname, '..', 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/watchlist', watchlistRoutes);
app.use('/user', userRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Watchtower API running on http://localhost:${PORT}`);
  startPriceChecker();
});
