import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('plana.db');

export type TransactionType = 'income' | 'expense' | 'loan';

export interface TransactionRow {
  id: number;
  account_id: number;
  type: TransactionType;
  category: string;
  amount: number;
  note: string | null;
  occurred_at: string;
}

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
      type TEXT NOT NULL CHECK(type IN ('income','expense','loan')),
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

export function getPrimaryAccountId() {
  initializeDatabase();

  let account = db.getFirstSync<{ id: number }>(
    `SELECT id FROM accounts ORDER BY id ASC LIMIT 1;`
  );

  if (!account) {
    db.runSync(
      `INSERT INTO accounts (name, type, balance, color) VALUES (?, ?, ?, ?);`,
      ['Main account', 'checking', 0, '#5B8DEF']
    );

    account = db.getFirstSync<{ id: number }>(
      `SELECT id FROM accounts ORDER BY id ASC LIMIT 1;`
    );
  }

  return account?.id ?? null;
}

export function addTransaction(input: {
  type: TransactionType;
  category: string;
  amount: number;
  note?: string | null;
  occurred_at?: string;
}) {
  initializeDatabase();

  const accountId = getPrimaryAccountId();

  if (accountId == null) {
    return null;
  }

  db.runSync(
    `INSERT INTO transactions (account_id, type, category, amount, note, occurred_at)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      accountId,
      input.type,
      input.category,
      Number(input.amount),
      input.note ?? null,
      input.occurred_at ?? new Date().toISOString(),
    ]
  );

  return true;
}

export function getTransactions(limit = 20) {
  initializeDatabase();

  return db.getAllSync<TransactionRow>(
    `SELECT id, account_id, type, category, amount, note, occurred_at
     FROM transactions
     ORDER BY occurred_at DESC
     LIMIT ?;`,
    [limit]
  );
}

export function getTransactionSummary() {
  const transactions = getTransactions(1000);

  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const loans = transactions
    .filter((item) => item.type === 'loan')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return {
    income,
    expenses,
    loans,
    net: income - expenses - loans,
    totalTransactions: transactions.length,
  };
}

export function seedSampleData() {
  initializeDatabase();

  const accountCount = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM accounts;`
  );

  if ((accountCount?.count ?? 0) > 0) {
    return;
  }

  db.runSync(
    `INSERT INTO accounts (name, type, balance, color) VALUES (?, ?, ?, ?);`,
    ['Main account', 'checking', 0, '#5B8DEF']
  );
}
