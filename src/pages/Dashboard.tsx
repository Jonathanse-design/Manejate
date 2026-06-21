import { BalanceCard } from '../components/dashboard/BalanceCard';
import { CreditCardSummary } from '../components/dashboard/CreditCardSummary';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardKpis } from '../components/dashboard/DashboardKpis';
import { FinancialAttention } from '../components/dashboard/FinancialAttention';
import { QuickActions } from '../components/dashboard/QuickActions';
import { SavingsSummary } from '../components/dashboard/SavingsSummary';
import { SpendingBreakdown } from '../components/dashboard/SpendingBreakdown';
import { UpcomingPayments } from '../components/dashboard/UpcomingPayments';
import type { PageKey } from '../components/layout/AppShell';
import { useFinance } from '../store/financeStore';
import type { AppData } from '../types/finance';
import {
  activeData,
  cardUsage,
  emergencyFundStatus,
  financialHealth,
  groupExpensesByCategory,
  totalsForPeriod,
  upcomingPayments
} from '../utils/calculations';
import { buildAlerts } from '../utils/alerts';
import { currentMonthPeriod } from '../utils/dates';

export const Dashboard = ({
  data,
  onNavigate
}: {
  data: AppData;
  onNavigate: (page: PageKey) => void;
}) => {
  const { togglePrivacy, resetDemo, switchMode } = useFinance();
  const active = activeData(data);
  const totals = totalsForPeriod(active.transactions, currentMonthPeriod());
  const alerts = buildAlerts(data);
  const categories = groupExpensesByCategory(active.transactions);
  const payments = upcomingPayments(active.products);
  const cards = cardUsage(active.products, active.cardConsumptions);
  const health = financialHealth(totals.income, totals.expenses);
  const emergency = emergencyFundStatus(active.emergencyFund, totals.fixed);
  const privacy = data.settings.privacyMode;
  const currency = data.settings.currency;
  const totalSavings = active.savingsGoals.reduce((total, goal) => total + goal.currentAmount, 0);
  const upcomingDebt = payments.slice(0, 4).reduce((total, payment) => total + payment.amount, 0);
  const hasNoData =
    active.mode === 'real' &&
    !active.transactions.length &&
    !active.products.length &&
    !active.savingsGoals.length;

  const loadDemo = () => {
    resetDemo();
    switchMode('demo');
  };

  return (
    <div className="dashboard-page">
      <DashboardHeader
        health={health}
        mode={active.mode}
        onTogglePrivacy={togglePrivacy}
        privacyMode={privacy}
        userName={data.settings.userName}
      />

      {active.mode === 'demo' && (
        <div className="demo-banner">
          <strong>Modo Demo</strong>
          <span>Estos datos son ficticios. Puedes cambiar a Modo Real en Ajustes.</span>
        </div>
      )}

      {hasNoData ? (
        <section className="empty-dashboard">
          <img src="./assets/logo-manejate-icon.svg" alt="" />
          <h2>Empieza registrando tu primer movimiento</h2>
          <p>Agrega un ingreso, un gasto o un producto bancario para ver tu resumen financiero.</p>
          <div>
            <button className="primary-btn" onClick={() => onNavigate('movements')} type="button">
              Agregar ingreso o gasto
            </button>
            <button className="secondary-btn" onClick={loadDemo} type="button">
              Cargar datos demo
            </button>
          </div>
        </section>
      ) : (
        <>
          <BalanceCard
            balance={totals.balance}
            currency={currency}
            expenses={totals.expenses}
            health={health}
            income={totals.income}
            privacyMode={privacy}
          />
          <DashboardKpis
            currency={currency}
            expenses={totals.expenses}
            income={totals.income}
            privacyMode={privacy}
            savings={totalSavings + active.emergencyFund.currentAmount}
            upcomingDebt={upcomingDebt}
          />

          <section className="dashboard-grid">
            <FinancialAttention alerts={alerts} />
            <UpcomingPayments
              currency={currency}
              payments={payments}
              privacyMode={privacy}
              products={active.products}
            />
            <SpendingBreakdown
              categories={categories}
              currency={currency}
              privacyMode={privacy}
              total={totals.expenses}
            />
            <CreditCardSummary cards={cards} currency={currency} privacyMode={privacy} />
            <SavingsSummary
              currency={currency}
              emergencyFund={active.emergencyFund}
              fixedExpenses={totals.fixed}
              goals={active.savingsGoals}
              privacyMode={privacy}
            />
            <article className={`panel emergency-nudge ${emergency.status}`}>
              <span>Fondo de emergencia</span>
              <strong>{emergency.status === 'completo' ? 'Meta cubierta' : `Cubre ${emergency.monthsCovered.toFixed(1)} meses`}</strong>
              <p>
                {emergency.status === 'crítico'
                  ? 'Tu fondo aún no cubre un mes de gastos fijos.'
                  : emergency.status === 'bajo'
                    ? 'Vas avanzando, pero todavía estás por debajo de dos meses.'
                    : 'Mantén aportes constantes para proteger tu flujo.'}
              </p>
            </article>
          </section>
          <QuickActions onNavigate={onNavigate} />
        </>
      )}
    </div>
  );
};
