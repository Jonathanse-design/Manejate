import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { AlertList } from '../components/alerts/AlertList';
import type { AppData } from '../types/finance';
import {
  activeData,
  cardUsage,
  emergencyFundStatus,
  groupExpensesByCategory,
  groupExpensesByType,
  monthlyTrend,
  totalsForPeriod
} from '../utils/calculations';
import { buildAlerts } from '../utils/alerts';
import { currentMonthPeriod } from '../utils/dates';
import { formatMoney, formatPercent } from '../utils/formatters';

const colors = ['#38BDF8', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#14B8A6'];

export const Analytics = ({ data }: { data: AppData }) => {
  const active = activeData(data);
  const totals = totalsForPeriod(active.transactions, currentMonthPeriod());
  const categoryData = groupExpensesByCategory(active.transactions);
  const typeData = groupExpensesByType(active.transactions);
  const trend = monthlyTrend(active.transactions);
  const cards = cardUsage(active.products, active.cardConsumptions).map((item) => ({
    name: item.card.name,
    consumo: item.consumed
  }));
  const emergency = emergencyFundStatus(active.emergencyFund, totals.fixed);
  const topCategory = categoryData[0];
  const privacy = data.settings.privacyMode;
  const currency = data.settings.currency;

  return (
    <div className="analytics-grid">
      <article className="panel wide">
        <div className="section-title">
          <h2>Ingresos vs gastos</h2>
          <span>Últimos 6 meses</span>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#23304A" />
              <XAxis dataKey="month" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155' }} />
              <Area dataKey="ingresos" stroke="#22C55E" fill="#22C55E33" />
              <Area dataKey="gastos" stroke="#EF4444" fill="#EF444433" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel">
        <h3>Gastos por categoría</h3>
        <div className="chart-box small">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData.slice(0, 6)} dataKey="value" nameKey="name" outerRadius={82}>
                {categoryData.slice(0, 6).map((_, index) => <Cell fill={colors[index % colors.length]} key={index} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel">
        <h3>Tipo de gasto</h3>
        <div className="chart-box small">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={typeData}>
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155' }} />
              <Bar dataKey="value" fill="#38BDF8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel">
        <h3>Consumos por tarjeta</h3>
        {cards.map((item) => (
          <div className="progress-row" key={item.name}>
            <span>{item.name}</span>
            <strong>{formatMoney(item.consumo, currency, privacy)}</strong>
            <div><i style={{ width: `${Math.min((item.consumo / Math.max(...cards.map((card) => card.consumo), 1)) * 100, 100)}%` }} /></div>
          </div>
        ))}
      </article>

      <article className="panel">
        <h3>Insights automáticos</h3>
        <div className="insight-list">
          <p>Categoría con mayor gasto: <strong>{topCategory?.name || 'Sin datos'}</strong>.</p>
          <p>Diferencia ingresos/gastos: <strong>{formatMoney(totals.balance, currency, privacy)}</strong>.</p>
          <p>Gastos fijos sobre ingresos: <strong>{formatPercent(totals.income ? (totals.fixed / totals.income) * 100 : 0)}</strong>.</p>
          <p>Fondo de emergencia: <strong>{emergency.status}</strong>.</p>
        </div>
      </article>

      <article className="panel wide">
        <h3>Centro de alertas</h3>
        <AlertList alerts={buildAlerts(data)} />
      </article>
    </div>
  );
};
