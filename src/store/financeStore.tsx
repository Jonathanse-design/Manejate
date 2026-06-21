import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { createEmergencyFund, createInitialData } from '../data/demoData';
import { loadAppData, replaceAppData, saveAppData } from '../db/database';
import type {
  AppData,
  AppMode,
  AppSettings,
  BankProduct,
  CardConsumption,
  EmergencyFund,
  SavingsContribution,
  SavingsGoal,
  Transaction
} from '../types/finance';
import { toDateKey } from '../utils/dates';
import { createId, nowIso } from '../utils/id';

export type OnboardingFlowPayload = {
  mode: AppMode;
  userName?: string;
  currency: string;
  country?: string;
  financialMonthStartDay: number;
  estimatedMonthlyIncome?: number;
  fixedExpenses?: { name: string; amount: number }[];
  bankProduct?: {
    type: BankProduct['type'];
    name: string;
    bank: string;
    balance: number;
    creditLimit?: number;
    paymentDueDay?: number;
    cutDay?: number;
  };
  savingsGoal?: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
  };
  emergencyFund?: {
    currentAmount: number;
    targetAmount: number;
    monthlyContribution: number;
    selectedMonths: EmergencyFund['selectedMonths'];
  };
  backupReminderEnabled: boolean;
  completedSteps: string[];
  skippedSteps: string[];
};

type FinanceContextValue = {
  data: AppData | null;
  loading: boolean;
  setData: (updater: (data: AppData) => AppData) => void;
  switchMode: (mode: AppMode) => void;
  completeOnboarding: (mode: AppMode) => void;
  completeOnboardingFlow: (payload: OnboardingFlowPayload) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  hideSetupProgress: () => void;
  togglePrivacy: () => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addProduct: (product: BankProduct) => void;
  updateProduct: (product: BankProduct) => void;
  deleteProduct: (id: string) => void;
  addCardConsumption: (consumption: CardConsumption) => void;
  deleteCardConsumption: (id: string) => void;
  addSavingsGoal: (goal: SavingsGoal) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  addSavingsContribution: (contribution: SavingsContribution) => void;
  updateEmergencyFund: (fund: EmergencyFund) => void;
  markBackupCreated: () => void;
  importData: (data: AppData) => Promise<void>;
  resetDemo: () => void;
  resetReal: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

const dateKeyInDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

const transactionFromOnboarding = (
  mode: AppMode,
  amount: number,
  description: string,
  category: string,
  kind: Transaction['kind'],
  expenseType?: Transaction['expenseType']
): Transaction => ({
  id: createId('tx'),
  mode,
  kind,
  amount,
  category,
  description,
  date: toDateKey(new Date()),
  method: kind === 'income' ? 'Transferencia' : 'Débito automático',
  note: 'Creado durante la configuración inicial.',
  recurring: expenseType === 'fixed',
  expenseType,
  createdAt: nowIso(),
  updatedAt: nowIso()
});

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [data, setDataState] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppData().then((loaded) => {
      setDataState(loaded);
      setLoading(false);
    });
  }, []);

  const setData = useCallback((updater: (data: AppData) => AppData) => {
    setDataState((current) => {
      if (!current) return current;
      const next = updater(current);
      void saveAppData(next);
      return next;
    });
  }, []);

  const replaceData = useCallback(async (next: AppData) => {
    await replaceAppData(next);
    setDataState(next);
  }, []);

  const value = useMemo<FinanceContextValue>(
    () => ({
      data,
      loading,
      setData,
      switchMode: (mode) =>
        setData((current) => ({
          ...current,
          settings: { ...current.settings, selectedMode: mode, updatedAt: nowIso() }
        })),
      completeOnboarding: (mode) =>
        setData((current) => ({
          ...current,
          settings: {
            ...current.settings,
            selectedMode: mode,
            hasCompletedOnboarding: true,
            onboarding: {
              ...current.settings.onboarding,
              completed: true,
              completedSteps: current.settings.onboarding?.completedSteps?.length
                ? current.settings.onboarding.completedSteps
                : ['welcome', 'summary'],
              skippedSteps: current.settings.onboarding?.skippedSteps || [],
              lastStep: 'summary',
              completedAt: nowIso()
            },
            updatedAt: nowIso()
          },
          emergencyFund: current.emergencyFund.mode === mode ? current.emergencyFund : createEmergencyFund(mode)
        })),
      completeOnboardingFlow: (payload) =>
        setData((current) => {
          const now = nowIso();
          const mode = payload.mode;
          const nextTransactions =
            mode === 'real'
              ? [
                  ...(payload.estimatedMonthlyIncome
                    ? [
                        transactionFromOnboarding(
                          mode,
                          payload.estimatedMonthlyIncome,
                          'Ingreso mensual estimado',
                          'Sueldo',
                          'income'
                        )
                      ]
                    : []),
                  ...(payload.fixedExpenses || [])
                    .filter((expense) => expense.name && expense.amount > 0)
                    .map((expense) =>
                      transactionFromOnboarding(mode, expense.amount, expense.name, 'Servicios', 'expense', 'fixed')
                    ),
                  ...current.transactions
                ]
              : current.transactions;
          const nextProducts =
            mode === 'real' && payload.bankProduct?.name
              ? [
                  {
                    id: createId('product'),
                    mode,
                    type: payload.bankProduct.type,
                    name: payload.bankProduct.name,
                    bank: payload.bankProduct.bank || 'Banco',
                    balance: payload.bankProduct.balance || 0,
                    currency: payload.currency,
                    color: payload.bankProduct.type === 'credit-card' ? '#8B5CF6' : '#2DD4BF',
                    creditLimit: payload.bankProduct.creditLimit,
                    cutDay: payload.bankProduct.cutDay,
                    paymentDueDay: payload.bankProduct.paymentDueDay,
                    createdAt: now,
                    updatedAt: now
                  },
                  ...current.products
                ]
              : current.products;
          const nextSavings =
            mode === 'real' && payload.savingsGoal?.name
              ? [
                  {
                    id: createId('goal'),
                    mode,
                    name: payload.savingsGoal.name,
                    targetAmount: payload.savingsGoal.targetAmount || 0,
                    currentAmount: payload.savingsGoal.currentAmount || 0,
                    targetDate: dateKeyInDays(180),
                    desiredMonthlyContribution: payload.savingsGoal.monthlyContribution || 0,
                    priority: 'alta' as const,
                    note: 'Creada durante la configuración inicial.',
                    createdAt: now,
                    updatedAt: now
                  },
                  ...current.savingsGoals
                ]
              : current.savingsGoals;
          const nextEmergency =
            mode === 'real'
              ? {
                  ...createEmergencyFund(mode),
                  currentAmount: payload.emergencyFund?.currentAmount || 0,
                  targetAmount: payload.emergencyFund?.targetAmount || 0,
                  monthlyContribution: payload.emergencyFund?.monthlyContribution || 0,
                  selectedMonths: payload.emergencyFund?.selectedMonths || 3,
                  targetDate: dateKeyInDays(240),
                  updatedAt: now
                }
              : current.emergencyFund.mode === 'demo'
                ? current.emergencyFund
                : createEmergencyFund('demo');

          return {
            ...current,
            settings: {
              ...current.settings,
              userName: payload.userName?.trim() || current.settings.userName || 'Jonathan',
              currency: payload.currency,
              country: payload.country?.trim() || current.settings.country,
              financialMonthStart: payload.financialMonthStartDay,
              financialMonthStartDay: payload.financialMonthStartDay,
              estimatedMonthlyIncome: payload.estimatedMonthlyIncome,
              backupReminderEnabled: payload.backupReminderEnabled,
              selectedMode: mode,
              hasCompletedOnboarding: true,
              onboarding: {
                completed: true,
                completedSteps: payload.completedSteps,
                skippedSteps: payload.skippedSteps,
                lastStep: 'summary',
                completedAt: now,
                hiddenSetupProgress: false
              },
              updatedAt: now
            },
            transactions: nextTransactions,
            products: nextProducts,
            savingsGoals: nextSavings,
            emergencyFund: nextEmergency
          };
        }),
      updateSettings: (settings) =>
        setData((current) => ({
          ...current,
          settings: { ...current.settings, ...settings, updatedAt: nowIso() }
        })),
      hideSetupProgress: () =>
        setData((current) => ({
          ...current,
          settings: {
            ...current.settings,
            onboarding: { ...current.settings.onboarding, hiddenSetupProgress: true },
            updatedAt: nowIso()
          }
        })),
      togglePrivacy: () =>
        setData((current) => ({
          ...current,
          settings: { ...current.settings, privacyMode: !current.settings.privacyMode, updatedAt: nowIso() }
        })),
      addTransaction: (transaction) =>
        setData((current) => ({ ...current, transactions: [transaction, ...current.transactions] })),
      updateTransaction: (transaction) =>
        setData((current) => ({
          ...current,
          transactions: current.transactions.map((item) => (item.id === transaction.id ? transaction : item))
        })),
      deleteTransaction: (id) =>
        setData((current) => ({
          ...current,
          transactions: current.transactions.filter((item) => item.id !== id)
        })),
      addProduct: (product) => setData((current) => ({ ...current, products: [product, ...current.products] })),
      updateProduct: (product) =>
        setData((current) => ({
          ...current,
          products: current.products.map((item) => (item.id === product.id ? product : item))
        })),
      deleteProduct: (id) =>
        setData((current) => ({ ...current, products: current.products.filter((item) => item.id !== id) })),
      addCardConsumption: (consumption) =>
        setData((current) => ({ ...current, cardConsumptions: [consumption, ...current.cardConsumptions] })),
      deleteCardConsumption: (id) =>
        setData((current) => ({
          ...current,
          cardConsumptions: current.cardConsumptions.filter((item) => item.id !== id)
        })),
      addSavingsGoal: (goal) =>
        setData((current) => ({ ...current, savingsGoals: [goal, ...current.savingsGoals] })),
      updateSavingsGoal: (goal) =>
        setData((current) => ({
          ...current,
          savingsGoals: current.savingsGoals.map((item) => (item.id === goal.id ? goal : item))
        })),
      addSavingsContribution: (contribution) =>
        setData((current) => ({
          ...current,
          savingsContributions: [contribution, ...current.savingsContributions],
          savingsGoals: current.savingsGoals.map((goal) =>
            goal.id === contribution.goalId
              ? { ...goal, currentAmount: goal.currentAmount + contribution.amount, updatedAt: nowIso() }
              : goal
          )
        })),
      updateEmergencyFund: (fund) => setData((current) => ({ ...current, emergencyFund: fund })),
      markBackupCreated: () =>
        setData((current) => ({
          ...current,
          settings: { ...current.settings, lastBackupAt: nowIso(), updatedAt: nowIso() }
        })),
      importData: replaceData,
      resetDemo: () => {
        const fresh = createInitialData();
        setData((current) => ({
          ...fresh,
          settings: {
            ...current.settings,
            selectedMode: 'demo',
            hasCompletedOnboarding: true,
            lastBackupAt: current.settings.lastBackupAt
          },
          transactions: [
            ...fresh.transactions,
            ...current.transactions.filter((item) => item.mode === 'real')
          ],
          products: [...fresh.products, ...current.products.filter((item) => item.mode === 'real')],
          cardConsumptions: [
            ...fresh.cardConsumptions,
            ...current.cardConsumptions.filter((item) => item.mode === 'real')
          ],
          savingsGoals: [...fresh.savingsGoals, ...current.savingsGoals.filter((item) => item.mode === 'real')],
          savingsContributions: current.savingsContributions.filter((item) => item.mode === 'real'),
          categories: [...fresh.categories, ...current.categories.filter((item) => item.mode === 'real')]
        }));
      },
      resetReal: () =>
        setData((current) => ({
          ...current,
          settings: { ...current.settings, selectedMode: 'real', updatedAt: nowIso() },
          transactions: current.transactions.filter((item) => item.mode !== 'real'),
          products: current.products.filter((item) => item.mode !== 'real'),
          cardConsumptions: current.cardConsumptions.filter((item) => item.mode !== 'real'),
          loanPayments: current.loanPayments.filter((item) => item.mode !== 'real'),
          savingsGoals: current.savingsGoals.filter((item) => item.mode !== 'real'),
          savingsContributions: current.savingsContributions.filter((item) => item.mode !== 'real'),
          emergencyFund: createEmergencyFund('real')
        }))
    }),
    [data, loading, replaceData, setData]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside FinanceProvider');
  return context;
};
