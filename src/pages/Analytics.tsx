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

const colors = ['#0057FF', '#7B2CFF', '#FF7A00', '#38BDF8', '#20E48A', '#FF5F7D'];
const tooltipStyle = {
  background: 'rgba(6, 18, 44, 0.92)',
  border: '1px solid rgba(154, 183, 255, 0.22)',
  borderRadius: 18,
  color: '#EEF4FF'
};

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
              <defs>
                <linearGradient id="incomeGlass" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.88} />
                  <stop offset="100%" stopColor="#20E48A" stopOpacity={0.28} />
                </linearGradient>
                <linearGradient id="expenseGlass" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.82} />
                  <stop offset="100%" stopColor="#7B2CFF" stopOpacity={0.26} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#23304A" />
              <XAxis dataKey="month" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area dataKey="ingresos" stroke="#38BDF8" strokeWidth={3} fill="url(#incomeGlass)" />
              <Area dataKey="gastos" stroke="#FF7A00" strokeWidth={3} fill="url(#expenseGlass)" />
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
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel">
        <h3>Tipo de gasto</h3>
        <div className="chart-box small">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={typeData}>
              <defs>
                <linearGradient id="barGlass" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="50%" stopColor="#7B2CFF" />
                  <stop offset="100%" stopColor="#FF7A00" />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="url(#barGlass)" radius={[14, 14, 4, 4]} />
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
