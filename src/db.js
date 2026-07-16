const Database = require('better-sqlite3');
const path = require('path');

// On platforms with a persistent volume (Railway, etc.), set DB_PATH to a path
// inside that volume, e.g. DB_PATH=/data/watchtower.sqlite
// Otherwise it defaults to the local db/ folder for development.
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'db', 'watchtower.sqlite');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// --- Schema ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    telegram_chat_id TEXT,
    plan TEXT NOT NULL DEFAULT 'free',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS watchlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    indicator_type TEXT NOT NULL DEFAULT 'price', -- 'price' or 'rsi'
    threshold REAL NOT NULL,
    direction TEXT NOT NULL, -- 'above' or 'below'
    is_active INTEGER NOT NULL DEFAULT 1,
    last_triggered_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS alerts_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    watchlist_item_id INTEGER NOT NULL,
    triggered_at TEXT NOT NULL DEFAULT (datetime('now')),
    value_at_trigger REAL NOT NULL,
    FOREIGN KEY (watchlist_item_id) REFERENCES watchlist_items(id) ON DELETE CASCADE
  );
`);

// Migration: add last_triggered_at to existing installs that predate this column.
try {
  db.exec('ALTER TABLE watchlist_items ADD COLUMN last_triggered_at TEXT');
} catch (err) {
  // Column already exists — safe to ignore.
}

module.exports = db;
