import type { LedgerEntry } from "@/lib/storage/indexeddb";

export interface LineItem {
  account: string;
  category: string;
  total: number;
}

export interface IncomeStatement {
  periodStart: string;
  periodEnd: string;
  revenue: LineItem[];
  totalRevenue: number;
  expenses: LineItem[];
  totalExpenses: number;
  netIncome: number;
  unresolvedItems: LedgerEntry[];
}

export function generateIncomeStatement(
  entries: LedgerEntry[],
  periodStart: string,
  periodEnd: string
): IncomeStatement {
  const filtered = entries.filter(
    (e) =>
      e.date >= periodStart &&
      e.date <= periodEnd &&
      !e.isTransfer &&
      !e.isOwnerDraw &&
      !e.isLoan
  );

  const revenueEntries = filtered.filter((e) => e.type === "credit");
  const expenseEntries = filtered.filter((e) => e.type === "debit");
  const unresolvedItems = filtered.filter(
    (e) => !e.reviewed || e.category === "Uncategorized"
  );

  const revenue = aggregateByAccount(revenueEntries);
  const expenses = aggregateByAccount(expenseEntries);
  const totalRevenue = revenue.reduce((sum, item) => sum + item.total, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.total, 0);

  return {
    periodStart,
    periodEnd,
    revenue,
    totalRevenue,
    expenses,
    totalExpenses,
    netIncome: totalRevenue - totalExpenses,
    unresolvedItems,
  };
}

function aggregateByAccount(entries: LedgerEntry[]): LineItem[] {
  const map = new Map<string, { category: string; total: number }>();

  for (const entry of entries) {
    const key = entry.account || entry.category || "Uncategorized";
    const existing = map.get(key);
    if (existing) {
      existing.total += entry.amount;
    } else {
      map.set(key, { category: entry.category, total: entry.amount });
    }
  }

  return Array.from(map.entries())
    .map(([account, { category, total }]) => ({ account, category, total }))
    .sort((a, b) => b.total - a.total);
}
