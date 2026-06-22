import { addDays, subDays } from 'date-fns';

import type { AppData, AppMode, AppSettings, BankProduct, Category, EmergencyFund, Transaction } from '../types/finance';
import { createId, nowIso } from '../utils/id';
import { toDateKey } from '../utils/dates';

const stamp = () => ({ createdAt: nowIso(), updatedAt: nowIso() });

export const defaultCategories = (mode: AppMode): Category[] =>
  [
    ['Sueldo', 'income'],
    ['Uber / transporte', 'income'],
    ['Freelance', 'income'],
    ['Ventas', 'income'],
    ['Vivienda', 'expense'],
    ['Comida', 'expense'],
    ['Transporte', 'expense'],
    ['Combustible', 'expense'],
    ['Servicios', 'expense'],
    ['Internet', 'expense'],
    ['Teléfono', 'expense'],
    ['Salud', 'expense'],
    ['Educación', 'expense'],
    ['Familia', 'expense'],
    ['Deudas', 'expense'],
    ['Tarjetas', 'expense'],
    ['Mantenimiento vehículo', 'expense'],
    ['Entretenimiento', 'expense'],
    ['Emergencias', 'expense'],
    ['Otros', 'both']
  ].map(([name, kind]) => ({
    id: createId('cat'),
    mode,
    name,
    kind: kind as Category['kind'],
    ...stamp()
  }));

export const createSettings = (): AppSettings => ({
  id: 'settings',
  mode: 'real',
  userName: undefined,
  dashboardGreeting: 'Tu dinero, bajo control.',
  currency: 'RD$',
  country: 'República Dominicana',
  financialMonthStart: 1,
  financialMonthStartDay: 1,
  estimatedMonthlyIncome: undefined,
  backupReminderEnabled: true,
  theme: 'light',
  privacyMode: false,
  selectedMode: 'demo',
  hasCompletedOnboarding: false,
  onboarding: {
    completed: false,
    completedSteps: [],
    skippedSteps: [],
    lastStep: 'welcome'
  },
  ...stamp()
});

export const createEmergencyFund = (mode: AppMode): EmergencyFund => ({
  id: `emergency-${mode}`,
  mode,
  currentAmount: mode === 'demo' ? 42000 : 0,
  targetAmount: mode === 'demo' ? 90000 : 0,
  monthlyContribution: mode === 'demo' ? 10000 : 0,
  selectedMonths: 3,
  targetDate: toDateKey(addDays(new Date(), 180)),
  accountName: mode === 'demo' ? 'Cuenta de ahorro separada' : '',
  notes: '',
  ...stamp()
});

const tx = (
  mode: AppMode,
  kind: Transaction['kind'],
  amount: number,
  category: string,
  description: string,
  daysAgo: number,
  expenseType?: Transaction['expenseType']
): Transaction => ({
  id: createId('tx'),
  mode,
  kind,
  amount,
  category,
  description,
  date: toDateKey(subDays(new Date(), daysAgo)),
  method: kind === 'income' ? 'Transferencia' : 'Tarjeta de débito',
  status: 'completed',
  note: '',
  recurring: expenseType === 'fixed',
  expenseType,
  ...stamp()
});

export const demoProducts = (): BankProduct[] => [
  {
    id: 'card-apap-demo',
    mode: 'demo',
    type: 'credit-card',
    name: 'Tarjeta APAP',
    bank: 'APAP',
    balance: 18500,
    currency: 'RD$',
    color: '#38BDF8',
    status: 'due-soon',
    creditLimit: 60000,
    cutDay: 18,
    paymentDueDay: 5,
    minimumPayment: 2800,
    estimatedPayment: 18500,
    ...stamp()
  },
  {
    id: 'card-qik-demo',
    mode: 'demo',
    type: 'credit-card',
    name: 'Tarjeta Qik',
    bank: 'Qik Banco Digital',
    balance: 9200,
    currency: 'RD$',
    color: '#8B5CF6',
    status: 'current',
    creditLimit: 25000,
    cutDay: 22,
    paymentDueDay: 10,
    minimumPayment: 1600,
    estimatedPayment: 9200,
    ...stamp()
  },
  {
    id: 'loan-reservas-demo',
    mode: 'demo',
    type: 'loan',
    name: 'Préstamo Banco Reservas',
    bank: 'Banco Reservas',
    balance: 145000,
    currency: 'RD$',
    color: '#22C55E',
    status: 'due-soon',
    originalAmount: 220000,
    monthlyPayment: 8900,
    paymentDay: 28,
    nextPaymentDate: toDateKey(addDays(new Date(), 6)),
    interestRate: 18,
    termMonths: 36,
    ...stamp()
  }
];

export const createInitialData = (): AppData => ({
  version: 1,
  settings: createSettings(),
  transactions: [
    tx('demo', 'income', 48000, 'Uber / transporte', 'Ingresos Uber', 8),
    tx('demo', 'income', 22000, 'Freelance', 'Proyecto diseño', 12),
    tx('demo', 'expense', 18000, 'Vivienda', 'Alquiler', 7, 'fixed'),
    tx('demo', 'expense', 5200, 'Combustible', 'Gasolina semanal', 4, 'variable'),
    tx('demo', 'expense', 3400, 'Comida', 'Supermercado', 3, 'variable'),
    tx('demo', 'expense', 2800, 'Internet', 'Internet hogar', 9, 'fixed'),
    tx('demo', 'expense', 8900, 'Deudas', 'Cuota préstamo', 2, 'fixed'),
    tx('demo', 'expense', 6500, 'Mantenimiento vehículo', 'Mantenimiento preventivo', 16, 'extraordinary')
  ],
  products: demoProducts(),
  cardConsumptions: [
    {
      id: createId('cc'),
      mode: 'demo',
      cardId: 'card-apap-demo',
      date: toDateKey(subDays(new Date(), 5)),
      amount: 6200,
      merchant: 'Supermercado Nacional',
      category: 'Comida',
      installments: 1,
      billingCycle: 'Actual',
      ...stamp()
    },
    {
      id: createId('cc'),
      mode: 'demo',
      cardId: 'card-qik-demo',
      date: toDateKey(subDays(new Date(), 2)),
      amount: 4200,
      merchant: 'Taller vehículo',
      category: 'Mantenimiento vehículo',
      installments: 1,
      billingCycle: 'Actual',
      ...stamp()
    }
  ],
  loanPayments: [],
  savingsGoals: [
    {
      id: 'goal-vehicle-demo',
      mode: 'demo',
      name: 'Mantenimiento del vehículo',
      targetAmount: 45000,
      currentAmount: 18000,
      targetDate: toDateKey(addDays(new Date(), 120)),
      desiredMonthlyContribution: 6500,
      priority: 'alta',
      note: 'Fondo para reparaciones y mantenimiento.',
      ...stamp()
    },
    {
      id: 'goal-debt-demo',
      mode: 'demo',
      name: 'Pago de deudas',
      targetAmount: 80000,
      currentAmount: 22000,
      targetDate: toDateKey(addDays(new Date(), 240)),
      desiredMonthlyContribution: 8500,
      priority: 'media',
      note: '',
      ...stamp()
    }
  ],
  savingsContributions: [],
  emergencyFund: createEmergencyFund('demo'),
  categories: [...defaultCategories('demo'), ...defaultCategories('real')]
});
