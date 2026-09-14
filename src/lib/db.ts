import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('plana.db');

let isDatabaseInitialized = false;

export function initializeDatabase() {
  if (isDatabaseInitialized) {
    return;
  }

  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0,
      color TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income','expense')),
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      limit_amount REAL NOT NULL,
      period TEXT NOT NULL DEFAULT 'monthly',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  isDatabaseInitialized = true;
}

export function getSetting(key: string) {
  initializeDatabase();

  const result = db.getFirstSync<{ value: string }>(
    `SELECT value FROM settings WHERE key = ?;`,
    [key]
  );

  return result?.value ?? null;
}

export function setSetting(key: string, value: string) {
  initializeDatabase();

  db.runSync(
    `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    [key, value]
  );
}

export function hasSeenOnboarding() {
  return getSetting('has_seen_onboarding') === 'true';
}

export function markOnboardingSeen() {
  setSetting('has_seen_onboarding', 'true');
}

export function seedSampleData() {
  initializeDatabase();

  const accountCount = db.getAllSync<{ id: number }>(`SELECT id FROM accounts LIMIT 1;`);

  if (accountCount.length > 0) {
    return;
  }

  db.runSync(
    `INSERT INTO accounts (name, type, balance, color) VALUES (?, ?, ?, ?);`,
    ['Main account', 'checking', 12480.5, '#5B8DEF']
  );
  db.runSync(
    `INSERT INTO accounts (name, type, balance, color) VALUES (?, ?, ?, ?);`,
    ['Savings', 'savings', 8600, '#22C55E']
  );

  db.runSync(
    `INSERT INTO transactions (account_id, type, category, amount, note, occurred_at) VALUES (?, ?, ?, ?, ?, ?);`,
    [1, 'income', 'Salary', 4200, 'Monthly paycheck', '2026-09-01T09:00:00.000Z']
  );
  db.runSync(
    `INSERT INTO transactions (account_id, type, category, amount, note, occurred_at) VALUES (?, ?, ?, ?, ?, ?);`,
    [1, 'expense', 'Rent', 1450, 'Apartment rent', '2026-09-03T12:00:00.000Z']
  );
  db.runSync(
    `INSERT INTO budgets (category, limit_amount, period) VALUES (?, ?, ?);`,
    ['Food', 700, 'monthly']
  );
}
