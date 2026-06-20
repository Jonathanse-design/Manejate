import { CreditCard, Landmark, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

import { AlertList } from '../components/alerts/AlertList';
import { KpiCard } from '../components/cards/KpiCard';
import type { AppData } from '../types/finance';
import {
  activeData,
  cardUsage,
  emergencyFundStatus,
  financialHealth,
  groupExpensesByCategory,
  loanCommitment,
  totalsForPeriod,
  upcomingPayments
} from '../utils/calculations';
import { buildAlerts } from '../utils/alerts';
import { currentMonthPeriod, humanDate } from '../utils/dates';
import { formatMoney, formatPercent } from '../utils/formatters';

export const Dashboard = ({ data }: { data: AppData }) => {
  const active = activeData(data);
  const totals = totalsForPeriod(active.transactions, currentMonthPeriod());
  const alerts = buildAlerts(data);
  const categories = groupExpensesByCategory(active.transactions).slice(0, 4);
  const usage = cardUsage(active.products, active.cardConsumptions);
  const health = financialHealth(totals.income, totals.expenses);
  const emergency = emergencyFundStatus(active.emergencyFund, totals.fixed);
  const privacy = data.settings.privacyMode;
  const currency = data.settings.currency;

  return (
    <div className="page-grid">
      <section className={`hero-panel health-${health}`}>
        <div>
          <p className="eyebrow">Resumen del mes</p>
          <h2>{health === 'healthy' ? 'Flujo saludable' : health === 'tight' ? 'Flujo ajustado' : 'Flujo crítico'}</h2>
          <p>
            Balance proyectado: <strong>{formatMoney(totals.balance, currency, privacy)}</strong>. Fondo de emergencia:{' '}
            <strong>{formatPercent(emergency.progress)}</strong>.
          </p>
        </div>
        <div className="hero-metric">
          <span>Ahorro estimado</span>
          <strong>{formatPercent(totals.savingsRate)}</strong>
        </div>
      </section>

      <section className="kpi-grid">
        <KpiCard icon={<TrendingUp size={18} />} label="Ingresos" tone="green" value={formatMoney(totals.income, currency, privacy)} />
        <KpiCard icon={<TrendingDown size={18} />} label="Gastos" tone="red" value={formatMoney(totals.expenses, currency, privacy)} />
        <KpiCard icon={<Wallet size={18} />} label="Balance" tone="blue" value={formatMoney(totals.balance, currency, privacy)} />
        <KpiCard icon={<Landmark size={18} />} label="Gastos fijos" tone="amber" value={formatMoney(totals.fixed, currency, privacy)} />
        <KpiCard label="Variables" tone="violet" value={formatMoney(totals.variable, currency, privacy)} />
        <KpiCard label="Extraordinarios" value={formatMoney(totals.extraordinary, currency, privacy)} />
        <KpiCard icon={<PiggyBank size={18} />} label="Fondo emergencia" tone="green" value={formatMoney(active.emergencyFund.currentAmount, currency, privacy)} helper={emergency.status} />
        <KpiCard icon={<CreditCard size={18} />} label="Deuda mensual" tone="red" value={formatMoney(loanCommitment(active.products), currency, privacy)} />
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="section-title">
            <h3>Alertas importantes</h3>
            <span>{alerts.length}</span>
          </div>
          <AlertList alerts={alerts} limit={5} />
        </article>

        <article className="panel">
          <div className="section-title">
            <h3>Próximos pagos</h3>
          </div>
          <div className="list-stack">
            {upcomingPayments(active.products).slice(0, 5).map((payment) => (
              <div className="row-item" key={payment.id}>
                <div>
                  <strong>{payment.title}</strong>
                  <span>{payment.type} · {humanDate(payment.date)}</span>
                </div>
                <b>{formatMoney(payment.amount, currency, privacy)}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-title">
            <h3>Gastos por categoría</h3>
          </div>
          <div className="list-stack">
            {categories.map((item) => (
              <div className="progress-row" key={item.name}>
                <span>{item.name}</span>
                <strong>{formatMoney(item.value, currency, privacy)}</strong>
                <div><i style={{ width: `${totals.expenses ? (item.value / totals.expenses) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-title">
            <h3>Tarjetas</h3>
          </div>
          <div className="list-stack">
            {usage.map((item) => (
              <div className="progress-row" key={item.card.id}>
                <span>{item.card.name}</span>
                <strong>{formatPercent(item.usage)}</strong>
                <div><i style={{ width: `${Math.min(item.usage, 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};
