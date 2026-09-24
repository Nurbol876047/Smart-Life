// Демо-деректерден есептелетін туынды мәндер (баланс, айлық қорытынды, т.б.)
// Бэкенд қосылғанда бұл функциялардың көбі сервер жағында есептеліп,
// дайын күйінде API арқылы келеді.

import { CATEGORIES, INITIAL_BALANCE, TRANSACTIONS } from './mockData';

export function currentBalance(transactions = TRANSACTIONS, initialBalance = INITIAL_BALANCE) {
  return transactions.reduce(
    (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
    initialBalance
  );
}

export function isInMonth(date, year, month) {
  return date.getFullYear() === year && date.getMonth() === month;
}

export function monthTotals(transactions, year, month) {
  const inMonth = transactions.filter((t) => isInMonth(t.date, year, month));
  const income = inMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = inMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, net: income - expense, count: inMonth.length };
}

export function lastMonths(count, refDate) {
  const list = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    list.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return list;
}

export function categoryBreakdown(transactions, year, month, kind = 'expense') {
  const inMonth = transactions.filter(
    (t) => t.type === kind && isInMonth(t.date, year, month)
  );
  const byCategory = {};
  for (const t of inMonth) {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  }
  const total = Object.values(byCategory).reduce((s, v) => s + v, 0);
  return Object.entries(byCategory)
    .map(([categoryId, amount]) => ({
      categoryId,
      label: CATEGORIES.find((c) => c.id === categoryId)?.label ?? 'Басқа',
      amount,
      percent: total ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function biggestCategory(transactions, year, month) {
  const breakdown = categoryBreakdown(transactions, year, month, 'expense');
  return breakdown[0] ?? null;
}

export function averageDailyExpense(transactions, year, month, dayCount) {
  const { expense } = monthTotals(transactions, year, month);
  return dayCount ? Math.round(expense / dayCount) : 0;
}

export function savingsRate(transactions, year, month) {
  const { income, expense } = monthTotals(transactions, year, month);
  if (!income) return 0;
  return Math.round(((income - expense) / income) * 100);
}

export function sortedByDateDesc(transactions) {
  return [...transactions].sort((a, b) => b.date - a.date);
}
