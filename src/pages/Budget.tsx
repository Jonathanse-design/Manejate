import { subMonths } from 'date-fns';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { CSSProperties } from 'react';

import { useFinance } from '../store/financeStore';
import { activeData, groupExpensesByCategory, totalsForPeriod } from '../utils/calculations';
import { currentMonthPeriod } from '../utils/dates';
import { formatMoney, formatPercent } from '../utils/formatters';

const suggestedBudgets: Record<string, number> = {
  Comida: 12000,
  Transporte: 7000,
  Vivienda: 20000,
  Servicios: 6500,
  Deudas: 14000,
  Familia: 8000,
  Salud: 5000,
  Educación: 6000,
  Entretenimiento: 4500,
  Otros: 5000
};

const previousMonthPeriod = () => {
  const now = new Date();
  const previous = subMonths(now, 1);
  return {
    from: new Date(previous.getFullYear(), previous.getMonth(), 1),
    to: new Date(previous.getFullYear(), previous.getMonth() + 1, 0, 23, 59, 59)
  };
};

export const Budget = () => {
  const { data } = useFinance();
  if (!data) return null;

  const active = activeData(data);
  const currency = data.settings.currency;
  const privacy = data.settings.privacyMode;
  const totals = totalsForPeriod(active.transactions, currentMonthPeriod());
  const previous = totalsForPeriod(active.transactions, previousMonthPeriod());
  const categories = groupExpensesByCategory(active.transactions);
  const budgetTotal = data.settings.estimatedMonthlyIncome
    ? data.settings.estimatedMonthlyIncome * 0.82
    : Math.max(totals.income * 0.82, totals.expenses * 1.12, 1);
  const available = budgetTotal - totals.expenses;
  const usedPercent = budgetTotal ? (totals.expenses / budgetTotal) * 100 : 0;
  const delta = previous.expenses ? ((totals.expenses - previous.expenses) / previous.expenses) * 100 : 0;

  const rows = Object.keys(suggestedBudgets).map((name) => {
    const spent = categories.find((item) => item.name === name)?.value || 0;
    const target = suggestedBudgets[name];
    const percent = target ? (spent / target) * 100 : 0;
    return { name, spent, target, percent };
  });

  return (
    <div className="budget-page">
      <section className="budget-hero">
        <div>
          <p className="eyebrow">Presupuesto mensual</p>
          <h2>Controla el ritmo antes de que el mes te controle.</h2>
          <p>Estás usando {formatPercent(usedPercent)} de tu presupuesto estimado.</p>
        </div>
        <div className="budget-ring" style={{ '--progress': `${Math.min(usedPercent, 100)}%` } as CSSProperties}>
          <strong>{formatPercent(usedPercent)}</strong>
          <span>usado</span>
        </div>
      </section>

      <section className="metric-grid three">
        <article className="metric-card">
          <span>Presupuesto total</span>
          <strong>{formatMoney(budgetTotal, currency, privacy)}</strong>
          <small>Referencia basada en ingresos y gastos actuales.</small>
        </article>
        <article className="metric-card">
          <span>Disponible</span>
          <strong className={available >= 0 ? 'positive' : 'negative'}>{formatMoney(available, currency, privacy)}</strong>
          <small>{available >= 0 ? 'Margen para el resto del mes.' : 'Hay exceso frente al plan.'}</small>
        </article>
        <article className="metric-card">
          <span>Vs. mes anterior</span>
          <strong className={delta <= 0 ? 'positive' : 'warning'}>{delta >= 0 ? '+' : ''}{formatPercent(delta)}</strong>
          <small>{delta <= 0 ? 'Gastaste menos que el mes pasado.' : 'Los gastos van por encima.'}</small>
        </article>
      </section>

      <section className="budget-grid">
        <article className="panel wide">
          <div className="section-title">
            <h2>Categorías</h2>
            <span>{rows.filter((item) => item.spent > 0).length} con movimiento</span>
          </div>
          <div className="budget-category-list">
            {rows.map((item) => (
              <div className={`budget-row ${item.percent >= 100 ? 'over' : item.percent >= 80 ? 'near' : ''}`} key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{formatMoney(item.spent, currency, privacy)} de {formatMoney(item.target, currency, privacy)}</span>
                </div>
                <div className="progress-row">
                  <b>{formatPercent(item.percent)}</b>
                  <div><i style={{ width: `${Math.min(item.percent, 100)}%` }} /></div>
                </div>
                <span className={`status-pill ${item.percent >= 100 ? 'danger' : item.percent >= 80 ? 'warning' : 'success'}`}>
                  {item.percent >= 100 ? <AlertTriangle size={14} /> : item.percent >= 80 ? <ArrowUpRight size={14} /> : <CheckCircle2 size={14} />}
                  {item.percent >= 100 ? 'Excedido' : item.percent >= 80 ? 'Atención' : 'En control'}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <h3>Acción recomendada</h3>
          <div className="recommendation-card">
            {usedPercent >= 90 ? <AlertTriangle /> : <ArrowDownRight />}
            <strong>{usedPercent >= 90 ? 'Reduce gastos variables esta semana.' : 'Mantén este ritmo.'}</strong>
            <p>
              {usedPercent >= 90
                ? 'Prioriza pagos obligatorios y evita consumos no esenciales hasta el próximo ingreso.'
                : 'Tus categorías principales están dentro de un rango manejable.'}
            </p>
          </div>
        </article>
      </section>
    </div>
  );
};
