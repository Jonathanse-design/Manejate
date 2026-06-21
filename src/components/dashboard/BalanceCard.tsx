import type { FinancialHealth } from '../../types/finance';
import { formatMoney, formatPercent } from '../../utils/formatters';

const recommendation: Record<FinancialHealth, string> = {
  healthy: 'Buen mes. Mantén el ritmo y aparta una parte para ahorro.',
  tight: 'Mantén controlados los gastos variables esta semana.',
  critical: 'Reduce gastos no esenciales y prioriza pagos próximos.'
};

export const BalanceCard = ({
  balance,
  income,
  expenses,
  savings,
  monthlyChange,
  currency,
  privacyMode,
  health
}: {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  monthlyChange: number;
  currency: string;
  privacyMode: boolean;
  health: FinancialHealth;
}) => {
  const spentPercent = income ? (expenses / income) * 100 : 0;
  return (
    <section className={`balance-card ${health}`}>
      <div>
        <span className="balance-label">Balance del mes</span>
        <strong>{formatMoney(balance, currency, privacyMode)}</strong>
        <p>{balance >= 0 ? 'disponibles' : 'por encima de tus ingresos'}</p>
      </div>
      <div className="balance-details">
        <span>Ingresos <b>{formatMoney(income, currency, privacyMode)}</b></span>
        <span>Gastos <b>{formatMoney(expenses, currency, privacyMode)}</b></span>
        <span>Resultado neto <b>{formatMoney(balance, currency, privacyMode)}</b></span>
        <span>Vs. mes anterior <b className={monthlyChange >= 0 ? 'positive' : 'negative'}>{monthlyChange >= 0 ? '+' : ''}{formatPercent(monthlyChange)}</b></span>
        <span>Ahorros y metas <b>{formatMoney(savings, currency, privacyMode)}</b></span>
        <span>Has usado <b>{formatPercent(spentPercent)}</b> de tus ingresos.</span>
      </div>
      <div className="balance-advice">
        <span>Estado: {health === 'healthy' ? 'Saludable' : health === 'tight' ? 'Ajustado' : 'Crítico'}</span>
        <p>{recommendation[health]}</p>
      </div>
    </section>
  );
};
