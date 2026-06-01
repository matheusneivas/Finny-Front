import api from './api';

export type Frequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  ONCE: 'Única vez',
  DAILY: 'Diário',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  YEARLY: 'Anual',
};

export interface TransactionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category?: TransactionCategory;
  transactionDate: string;
  frequency?: Frequency;
  dueDayOfMonth?: number;
  notes?: string;
  createdAt: string;
  recurrenceGroupId?: string | null;
}

export interface TransactionPayload {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId?: string | null;
  description: string;
  transactionDate: string;
  frequency?: Frequency;
  repeatCount?: number | null;
  dueDayOfMonth?: number | null;
  notes?: string;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface SpendingByCategory {
  startDate: string;
  endDate: string;
  totalExpense: number;
  categories: CategorySpending[];
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface TransactionPage {
  content: Transaction[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export async function getCategories(type?: 'EXPENSE' | 'INCOME'): Promise<Category[]> {
  const params = type ? { type } : undefined;
  const res = await api.get('/api/v1/categories', { params });
  return Array.isArray(res.data) ? res.data : res.data.content ?? [];
}

export async function getSpendingByCategory(startDate: string, endDate: string): Promise<SpendingByCategory> {
  const res = await api.get('/api/v1/transactions/by-category', { params: { startDate, endDate } });
  return res.data;
}

export async function getTransactionSummary(startDate: string, endDate: string): Promise<TransactionSummary> {
  const res = await api.get('/api/v1/transactions/summary', { params: { startDate, endDate } });
  const d = res.data;
  // Normalize field names — API may use different casing
  return {
    totalIncome:   d.totalIncome   ?? d.income      ?? d.totalRevenue  ?? d.revenue    ?? 0,
    totalExpense:  d.totalExpense  ?? d.expense      ?? d.totalExpenses ?? d.expenses   ?? 0,
    balance:       d.balance       ?? d.netBalance   ?? d.net           ?? 0,
    transactionCount: d.transactionCount ?? d.count  ?? 0,
  };
}

export async function getTransactions(page = 0, size = 20, startDate?: string, endDate?: string): Promise<TransactionPage> {
  const params: Record<string, unknown> = startDate || endDate
    ? { startDate, endDate }
    : { page, size };
  const res = await api.get('/api/v1/transactions', { params });
  return res.data;
}

export async function createTransaction(data: TransactionPayload): Promise<Transaction> {
  const res = await api.post('/api/v1/transactions', data);
  return res.data;
}

export async function updateTransaction(id: string, data: TransactionPayload): Promise<Transaction> {
  const res = await api.put(`/api/v1/transactions/${id}`, data);
  return res.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/api/v1/transactions/${id}`);
}

export async function deleteRecurrence(id: string, mode: 'ALL' | 'THIS_AND_FUTURE'): Promise<void> {
  await api.delete(`/api/v1/transactions/${id}/recurrence`, { params: { mode } });
}
