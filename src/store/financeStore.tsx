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
  BankProduct,
  CardConsumption,
  EmergencyFund,
  SavingsContribution,
  SavingsGoal,
  Transaction
} from '../types/finance';
import { nowIso } from '../utils/id';

type FinanceContextValue = {
  data: AppData | null;
  loading: boolean;
  setData: (updater: (data: AppData) => AppData) => void;
  switchMode: (mode: AppMode) => void;
  completeOnboarding: (mode: AppMode) => void;
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
            updatedAt: nowIso()
          },
          emergencyFund: current.emergencyFund.mode === mode ? current.emergencyFund : createEmergencyFund(mode)
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
