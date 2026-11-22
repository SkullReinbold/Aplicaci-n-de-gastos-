import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { startOfWeek } from 'date-fns';
import { Budget, Category, Expense } from './types';
import { decrypt, encrypt } from './crypto';

let db: SQLite.SQLiteDatabase;

export async function initDb() {
  db = await SQLite.openDatabaseAsync('gastos.db');
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE);
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY, amount REAL NOT NULL, description TEXT NOT NULL, note_enc TEXT,
      category_id TEXT NOT NULL REFERENCES categories(id), date TEXT NOT NULL,
      receipt_uri TEXT, synced INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY, category_id TEXT REFERENCES categories(id),
      limit_amount REAL NOT NULL, period TEXT NOT NULL DEFAULT 'weekly');`);
  const n = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) c FROM categories');
  if (n && n.c === 0) {
    for (const name of ['Comida', 'Transporte', 'Ocio', 'Servicios', 'Otros'])
      await db.runAsync('INSERT INTO categories VALUES (?,?)', Crypto.randomUUID(), name);
  }
}

export const getCategories = () => db.getAllAsync<Category>('SELECT id, name FROM categories');

// ---- CRUD de gastos (consultas parametrizadas) ----
export async function createExpense(e: Omit<Expense, 'id' | 'date' | 'synced'>) {
  await db.runAsync(
    'INSERT INTO expenses VALUES (?,?,?,?,?,?,?,0)',
    Crypto.randomUUID(), e.amount, e.description, await encrypt(e.note),
    e.categoryId, new Date().toISOString(), e.receiptUri);
}
export async function listExpenses(): Promise<Expense[]> {
  const rows = await db.getAllAsync<any>('SELECT * FROM expenses ORDER BY date DESC');
  return Promise.all(rows.map(async r => ({
    id: r.id, amount: r.amount, description: r.description, note: await decrypt(r.note_enc),
    categoryId: r.category_id, date: r.date, receiptUri: r.receipt_uri, synced: r.synced })));
}
export async function updateExpense(id: string, e: { amount: number; description: string; note: string; categoryId: string }) {
  await db.runAsync(
    'UPDATE expenses SET amount=?, description=?, note_enc=?, category_id=?, synced=0 WHERE id=?',
    e.amount, e.description, await encrypt(e.note), e.categoryId, id);
}
export const deleteExpense = (id: string) => db.runAsync('DELETE FROM expenses WHERE id=?', id);
export async function markSynced(id: string) { await db.runAsync('UPDATE expenses SET synced=1 WHERE id=?', id); }

// ---- Presupuesto ----
export async function getBudget(): Promise<Budget | null> {
  const r = await db.getFirstAsync<any>('SELECT * FROM budgets LIMIT 1');
  return r ? { id: r.id, categoryId: r.category_id, limitAmount: r.limit_amount, period: 'weekly' } : null;
}
export async function saveBudget(limit: number) {
  await db.runAsync('DELETE FROM budgets');
  await db.runAsync('INSERT INTO budgets (id, category_id, limit_amount) VALUES (?,NULL,?)', Crypto.randomUUID(), limit);
}
export async function weeklyTotal(): Promise<number> {
  const from = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
  const r = await db.getFirstAsync<{ t: number | null }>('SELECT SUM(amount) t FROM expenses WHERE date >= ?', from);
  return r?.t ?? 0;
}
