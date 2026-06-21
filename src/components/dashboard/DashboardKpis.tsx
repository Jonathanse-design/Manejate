import { CalendarClock, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';

import { KpiCard } from '../cards/KpiCard';
import { formatMoney, formatPercent } from '../../utils/formatters';

export const DashboardKpis = ({
  income,
  expenses,
  savings,
  upcomingDebt,
  currency,
  privacyMode
}: {
  income: number;
  expenses: number;
  savings: number;
  upcomingDebt: number;
  currency: string;
  privacyMode: boolean;
}) => (
  <section className="dashboard-kpis">
    <KpiCard
      helper="registrado este mes"
      icon={<TrendingUp size={18} />}
      label="Ingresos"
      tone="green"
      value={formatMoney(income, currency, privacyMode)}
    />
    <KpiCard
      helper={`${formatPercent(income ? (expenses / income) * 100 : 0)} de tus ingresos`}
      icon={<TrendingDown size={18} />}
      label="Gastos"
      tone="red"
      value={formatMoney(expenses, currency, privacyMode)}
    />
    <KpiCard
      helper={`${formatPercent(income ? (savings / income) * 100 : 0)} de tus ingresos`}
      icon={<PiggyBank size={18} />}
      label="Ahorro"
      tone="blue"
      value={formatMoney(savings, currency, privacyMode)}
    />
    <KpiCard
      helper="pagos próximos"
      icon={<CalendarClock size={18} />}
      label="Deudas"
      tone="amber"
      value={formatMoney(upcomingDebt, currency, privacyMode)}
    />
  </section>
);
