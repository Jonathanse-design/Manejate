export type AppMode = 'demo' | 'real';
export type TransactionKind = 'income' | 'expense';
export type ExpenseType = 'fixed' | 'variable' | 'extraordinary';
export type ProductType = 'credit-card' | 'loan' | 'bank-account' | 'other';
export type AlertLevel = 'info' | 'warning' | 'critical' | 'success';
export type FinancialHealth = 'healthy' | 'tight' | 'critical';

export interface BaseEntity {
  id: string;
  mode: AppMode;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction extends BaseEntity {
  kind: TransactionKind;
  date: string;
  amount: number;
  category: string;
  description: string;
  method: string;
  note?: string;
  recurring: boolean;
  expenseType?: ExpenseType;
  linkedProductId?: string;
}

export interface BankProduct extends BaseEntity {
  type: ProductType;
  name: string;
  bank: string;
  balance: number;
  currency: string;
  color: string;
  notes?: string;
  creditLimit?: number;
  cutDay?: number;
  paymentDueDay?: number;
  minimumPayment?: number;
  estimatedPayment?: number;
  interestRate?: number;
  originalAmount?: number;
  monthlyPayment?: number;
  paymentDay?: number;
  nextPaymentDate?: string;
  termMonths?: number;
}

export interface CardConsumption extends BaseEntity {
  cardId: string;
  date: string;
  amount: number;
  merchant: string;
  category: string;
  installments?: number;
  note?: string;
  billingCycle?: string;
}

export interface LoanPayment extends BaseEntity {
  loanId: string;
  date: string;
  amount: number;
  note?: string;
}

export interface SavingsGoal extends BaseEntity {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  desiredMonthlyContribution: number;
  priority: 'alta' | 'media' | 'baja';
  note?: string;
}

export interface SavingsContribution extends BaseEntity {
  goalId: string;
  date: string;
  amount: number;
  source: string;
  note?: string;
}

export interface EmergencyFund extends BaseEntity {
  currentAmount: number;
  targetAmount: number;
  monthlyContribution: number;
  selectedMonths: 1 | 3 | 6;
  targetDate?: string;
  accountName?: string;
  notes?: string;
}

export interface Category extends BaseEntity {
  name: string;
  kind: TransactionKind | 'both';
}

export interface AppSettings extends BaseEntity {
  userName: string;
  currency: string;
  financialMonthStart: number;
  theme: 'dark' | 'light';
  privacyMode: boolean;
  selectedMode: AppMode;
  hasCompletedOnboarding: boolean;
  lastBackupAt?: string;
}

export interface FinanceAlert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  date: string;
  action: string;
  relatedId?: string;
}

export interface AppData {
  version: number;
  settings: AppSettings;
  transactions: Transaction[];
  products: BankProduct[];
  cardConsumptions: CardConsumption[];
  loanPayments: LoanPayment[];
  savingsGoals: SavingsGoal[];
  savingsContributions: SavingsContribution[];
  emergencyFund: EmergencyFund;
  categories: Category[];
}

export interface PeriodFilter {
  from: Date;
  to: Date;
}
