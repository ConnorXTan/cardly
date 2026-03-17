const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data.sqlite');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      company_name TEXT,
      phone TEXT,
      avatar_url TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      full_name TEXT,
      job_title TEXT,
      company TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      tagline TEXT,
      photo_path TEXT,
      template TEXT DEFAULT 'minimal',
      color_primary TEXT DEFAULT '#1a1a2e',
      color_secondary TEXT DEFAULT '#ffffff',
      social_links TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  console.log('Database ready');
};

module.exports = { db, initializeDatabase };