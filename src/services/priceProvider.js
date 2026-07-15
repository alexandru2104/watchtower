// CoinGecko price provider (free tier, no API key needed).
// Symbols used by users (e.g. "BTC") are mapped to CoinGecko's internal ids (e.g. "bitcoin").

const SYMBOL_TO_ID = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  MATIC: 'matic-network',
  DOT: 'polkadot',
  LTC: 'litecoin',
};

// Simple in-memory cache to avoid hammering the API when many alerts share a symbol
// or the cron tick fires faster than the API's rate limit allows.
const cache = new Map();
const CACHE_TTL_MS = 30 * 1000; // 30s

async function fetchPrice(symbol) {
  const upperSymbol = symbol.toUpperCase();
  const coinId = SYMBOL_TO_ID[upperSymbol];

  if (!coinId) {
    throw new Error(`Unknown symbol "${symbol}". Add it to SYMBOL_TO_ID in priceProvider.js.`);
  }

  const cached = cache.get(coinId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.price;
  }

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
  );

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const price = data[coinId]?.usd;

  if (price === undefined) {
    throw new Error(`No price returned for ${coinId}`);
  }

  cache.set(coinId, { price, timestamp: Date.now() });
  return price;
}

module.exports = { fetchPrice, SYMBOL_TO_ID };
