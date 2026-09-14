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

export interface CategoryRow {
  id: number;
  type: TransactionType;
  name: string;
}

export interface BudgetRow {
  id: number;
  category: string;
  limit_amount: number;
  period: string;
  created_at: string;
}

export interface BudgetUsageRow extends BudgetRow {
  spent: number;
  remaining: number;
  progress: number;
}

let isDatabaseInitialized = false;

export function initializeDatabase() {
  if (isDatabaseInitialized) {
    return;
  }

  const defaultCategories: Array<[TransactionType, string]> = [
    ['income', 'Salary'],
    ['income', 'Allowance'],
    ['income', 'Freelance'],
    ['income', 'Business'],
    ['expense', 'Rent'],
    ['expense', 'Groceries'],
    ['expense', 'Transport'],
    ['expense', 'Utilities'],
    ['expense', 'School Fees'],
    ['loan', 'Family Loan'],
    ['loan', 'Bank Loan'],
    ['loan', 'Repayment'],
  ];

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

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('income','expense','loan')),
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(type, name)
    );
  `);

  isDatabaseInitialized = true;

  for (const [type, name] of defaultCategories) {
    saveCategory(type, name);
  }
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

export function getCategories(type?: TransactionType) {
  initializeDatabase();

  if (type) {
    return db.getAllSync<CategoryRow>(
      `SELECT id, type, name FROM categories WHERE type = ? ORDER BY name ASC;`,
      [type]
    );
  }

  return db.getAllSync<CategoryRow>(
    `SELECT id, type, name FROM categories ORDER BY type ASC, name ASC;`
  );
}

export function saveCategory(type: TransactionType, name: string) {
  initializeDatabase();

  const cleanedName = name.trim();

  if (!cleanedName) {
    return;
  }

  db.runSync(
    `INSERT OR IGNORE INTO categories (type, name) VALUES (?, ?);`,
    [type, cleanedName]
  );
}

export function getBudgets(period = 'monthly') {
  initializeDatabase();

  return db.getAllSync<BudgetRow>(
    `SELECT id, category, limit_amount, period, created_at
     FROM budgets
     WHERE period = ?
     ORDER BY created_at DESC;`,
    [period]
  );
}

export function saveBudget(input: {
  id?: number;
  category: string;
  limit_amount: number;
  period?: string;
}) {
  initializeDatabase();

  const cleanedCategory = input.category.trim();
  const limitAmount = Number(input.limit_amount);
  const period = input.period ?? 'monthly';

  if (!cleanedCategory || !Number.isFinite(limitAmount) || limitAmount <= 0) {
    return null;
  }

  if (input.id) {
    db.runSync(
      `UPDATE budgets
       SET category = ?, limit_amount = ?, period = ?, created_at = CURRENT_TIMESTAMP
       WHERE id = ?;`,
      [cleanedCategory, limitAmount, period, input.id]
    );

    return input.id;
  }

  const existing = db.getFirstSync<{ id: number }>(
    `SELECT id FROM budgets WHERE category = ? AND period = ?;`,
    [cleanedCategory, period]
  );

  if (existing) {
    db.runSync(
      `UPDATE budgets
       SET limit_amount = ?, created_at = CURRENT_TIMESTAMP
       WHERE id = ?;`,
      [limitAmount, existing.id]
    );

    return existing.id;
  }

  db.runSync(
    `INSERT INTO budgets (category, limit_amount, period) VALUES (?, ?, ?);`,
    [cleanedCategory, limitAmount, period]
  );

  return true;
}

export function deleteBudget(id: number) {
  initializeDatabase();

  db.runSync(
    `DELETE FROM budgets WHERE id = ?;`,
    [id]
  );

  return true;
}

export function getBudgetsWithUsage(period = 'monthly', referenceDate: Date = new Date()) {
  const budgets = getBudgets(period);

  const startOfPeriod = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const endOfPeriod = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);

  const transactions = getTransactions(1000, {
    startDate: startOfPeriod.toISOString(),
    endDate: endOfPeriod.toISOString(),
  });

  const spentByCategory = transactions.reduce<Record<string, number>>((acc, item) => {
    if (item.type !== 'expense') {
      return acc;
    }

    acc[item.category] = (acc[item.category] ?? 0) + Number(item.amount);
    return acc;
  }, {});

  return budgets.map((budget) => {
    const spent = spentByCategory[budget.category] ?? 0;
    const remaining = budget.limit_amount - spent;
    const progress = budget.limit_amount > 0 ? Math.min((spent / budget.limit_amount) * 100, 100) : 0;

    return {
      ...budget,
      spent,
      remaining,
      progress,
    } satisfies BudgetUsageRow;
  });
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

  const cleanedCategory = input.category?.trim();

  if (cleanedCategory) {
    saveCategory(input.type, cleanedCategory);
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

export interface TransactionQueryOptions {
  startDate?: string;
  endDate?: string;
}

export function getTransactions(limit = 20, filters?: TransactionQueryOptions) {
  initializeDatabase();

  const clauses: string[] = [];
  const params: Array<string | number> = [];

  if (filters?.startDate) {
    clauses.push('occurred_at >= ?');
    params.push(filters.startDate);
  }

  if (filters?.endDate) {
    clauses.push('occurred_at < ?');
    params.push(filters.endDate);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  return db.getAllSync<TransactionRow>(
    `SELECT id, account_id, type, category, amount, note, occurred_at
     FROM transactions
     ${whereClause}
     ORDER BY occurred_at DESC
     LIMIT ?;`,
    [...params, limit]
  );
}

export function getTransactionSummary(filters?: TransactionQueryOptions) {
  const transactions = getTransactions(1000, filters);

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
