import { differenceInCalendarDays, parseISO } from 'date-fns';

import type {
  AppData,
  AppMode,
  BankProduct,
  EmergencyFund,
  FinancialHealth,
  PeriodFilter,
  Transaction
} from '../types/finance';
import { currentMonthPeriod, inPeriod, nextDateFromDay, today } from './dates';

export const byMode = <T extends { mode: AppMode }>(items: T[], mode: AppMode) =>
  items.filter((item) => item.mode === mode);

export const activeData = (data: AppData) => {
  const mode = data.settings.selectedMode;
  return {
    mode,
    transactions: byMode(data.transactions, mode),
    products: byMode(data.products, mode),
    cardConsumptions: byMode(data.cardConsumptions, mode),
    loanPayments: byMode(data.loanPayments, mode),
    savingsGoals: byMode(data.savingsGoals, mode),
    savingsContributions: byMode(data.savingsContributions, mode),
    emergencyFund: data.emergencyFund.mode === mode ? data.emergencyFund : data.emergencyFund
  };
};

export const transactionsInPeriod = (transactions: Transaction[], period: PeriodFilter) =>
  transactions.filter((transaction) => inPeriod(transaction.date, period));

export const sum = (items: number[]) => items.reduce((total, value) => total + Number(value || 0), 0);

export const totalsForPeriod = (transactions: Transaction[], period = currentMonthPeriod()) => {
  const scoped = transactionsInPeriod(transactions, period);
  const income = sum(scoped.filter((item) => item.kind === 'income').map((item) => item.amount));
  const expenses = sum(scoped.filter((item) => item.kind === 'expense').map((item) => item.amount));
  const fixed = sum(scoped.filter((item) => item.expenseType === 'fixed').map((item) => item.amount));
  const variable = sum(scoped.filter((item) => item.expenseType === 'variable').map((item) => item.amount));
  const extraordinary = sum(scoped.filter((item) => item.expenseType === 'extraordinary').map((item) => item.amount));
  return {
    income,
    expenses,
    balance: income - expenses,
    fixed,
    variable,
    extraordinary,
    savingsRate: income ? ((income - expenses) / income) * 100 : 0
  };
};

export const groupExpensesByCategory = (transactions: Transaction[], period = currentMonthPeriod()) => {
  const grouped = new Map<string, number>();
  transactionsInPeriod(transactions, period)
    .filter((item) => item.kind === 'expense')
    .forEach((item) => grouped.set(item.category, (grouped.get(item.category) || 0) + item.amount));
  return Array.from(grouped, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

export const groupExpensesByType = (transactions: Transaction[], period = currentMonthPeriod()) => {
  const totals = totalsForPeriod(transactions, period);
  return [
    { name: 'Fijos', value: totals.fixed },
    { name: 'Variables', value: totals.variable },
    { name: 'Extraordinarios', value: totals.extraordinary }
  ].filter((item) => item.value > 0);
};

export const monthlyTrend = (transactions: Transaction[]) => {
  const grouped = new Map<string, { month: string; ingresos: number; gastos: number }>();
  transactions.forEach((item) => {
    const date = parseISO(item.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const entry = grouped.get(month) || { month, ingresos: 0, gastos: 0 };
    if (item.kind === 'income') entry.ingresos += item.amount;
    else entry.gastos += item.amount;
    grouped.set(month, entry);
  });
  return Array.from(grouped.values()).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
};

export const creditCards = (products: BankProduct[]) => products.filter((item) => item.type === 'credit-card');
export const loans = (products: BankProduct[]) => products.filter((item) => item.type === 'loan');

export const cardUsage = (products: BankProduct[], cardConsumptions: AppData['cardConsumptions']) =>
  creditCards(products).map((card) => {
    const consumed = sum(cardConsumptions.filter((item) => item.cardId === card.id).map((item) => item.amount));
    const limit = card.creditLimit || 0;
    return {
      card,
      consumed,
      available: Math.max(limit - consumed, 0),
      usage: limit ? (consumed / limit) * 100 : 0,
      dueDate: nextDateFromDay(card.paymentDueDay),
      cutDate: nextDateFromDay(card.cutDay)
    };
  });

export const loanCommitment = (products: BankProduct[]) => sum(loans(products).map((loan) => loan.monthlyPayment || 0));

export const upcomingPayments = (products: BankProduct[]) =>
  products
    .flatMap((product) => {
      if (product.type === 'credit-card') {
        return [{
          id: product.id,
          title: product.name,
          type: 'Tarjeta',
          amount: product.estimatedPayment || product.minimumPayment || product.balance,
          date: nextDateFromDay(product.paymentDueDay)
        }];
      }
      if (product.type === 'loan') {
        return [{
          id: product.id,
          title: product.name,
          type: 'Préstamo',
          amount: product.monthlyPayment || 0,
          date: product.nextPaymentDate || nextDateFromDay(product.paymentDay)
        }];
      }
      return [];
    })
    .sort((a, b) => a.date.localeCompare(b.date));

export const financialHealth = (income: number, expenses: number): FinancialHealth => {
  if (!income && expenses) return 'critical';
  if (expenses > income) return 'critical';
  if (income && expenses / income >= 0.8) return 'tight';
  return 'healthy';
};

export const emergencyFundStatus = (fund: EmergencyFund, fixedMonthlyExpenses: number) => {
  const target = fund.targetAmount || fixedMonthlyExpenses * fund.selectedMonths;
  const remaining = Math.max(target - fund.currentAmount, 0);
  const monthsCovered = fixedMonthlyExpenses ? fund.currentAmount / fixedMonthlyExpenses : 0;
  const progress = target ? Math.min((fund.currentAmount / target) * 100, 100) : 0;
  let status: 'crítico' | 'bajo' | 'en progreso' | 'completo' = 'en progreso';
  if (progress >= 100) status = 'completo';
  else if (monthsCovered < 1) status = 'crítico';
  else if (monthsCovered < 2) status = 'bajo';

  const daysRemaining = fund.targetDate ? Math.max(differenceInCalendarDays(parseISO(fund.targetDate), today()), 1) : 180;
  const dailyNeeded = remaining / daysRemaining;
  return {
    target,
    remaining,
    monthsCovered,
    progress,
    status,
    dailyNeeded,
    weeklyNeeded: dailyNeeded * 7,
    monthlyNeeded: dailyNeeded * 30
  };
};
