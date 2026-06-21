import { Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { TransactionForm } from '../components/forms/TransactionForm';
import { useFinance } from '../store/financeStore';
import type { TransactionStatus } from '../types/finance';
import { activeData, totalsForPeriod } from '../utils/calculations';
import { currentMonthPeriod, humanDate } from '../utils/dates';
import { formatMoney } from '../utils/formatters';

export const Movements = () => {
  const { data, addTransaction, deleteTransaction } = useFinance();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [productId, setProductId] = useState('all');
  const [status, setStatus] = useState<TransactionStatus | 'all'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  if (!data) return null;
  const active = activeData(data);
  const currency = data.settings.currency;
  const productName = (id?: string) => active.products.find((product) => product.id === id)?.name || 'Sin producto';
  const categories = Array.from(new Set(active.transactions.map((item) => item.category))).sort();
  const filtered = active.transactions.filter((item) => {
    const matchesQuery = `${item.description} ${item.category} ${item.note || ''}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = type === 'all' || item.kind === type || (type === 'debt-payment' && item.category === 'Deudas') || (type === 'saving' && item.category === 'Ahorro');
    const matchesCategory = category === 'all' || item.category === category;
    const matchesProduct = productId === 'all' || item.linkedProductId === productId;
    const matchesStatus = status === 'all' || (item.status || 'completed') === status;
    const matchesFrom = !from || item.date >= from;
    const matchesTo = !to || item.date <= to;
    const matchesAmount = !minAmount || item.amount >= Number(minAmount);
    return matchesQuery && matchesType && matchesCategory && matchesProduct && matchesStatus && matchesFrom && matchesTo && matchesAmount;
  });
  const totals = useMemo(() => totalsForPeriod(filtered, currentMonthPeriod()), [filtered]);

  return (
    <div className="two-column movements-layout">
      <section>
        <div className="section-title">
          <h2>Movimientos</h2>
          <span>{filtered.length} registros</span>
        </div>
        <div className="toolbar">
          <Search size={18} />
          <input onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por categoría o nota" value={query} />
        </div>
        <div className="filter-grid">
          <label>Desde<input onChange={(event) => setFrom(event.target.value)} type="date" value={from} /></label>
          <label>Hasta<input onChange={(event) => setTo(event.target.value)} type="date" value={to} /></label>
          <label>
            Tipo
            <select onChange={(event) => setType(event.target.value)} value={type}>
              <option value="all">Todos</option>
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
              <option value="debt-payment">Pago de deuda</option>
              <option value="saving">Ahorro</option>
            </select>
          </label>
          <label>
            Categoría
            <select onChange={(event) => setCategory(event.target.value)} value={category}>
              <option value="all">Todas</option>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Producto
            <select onChange={(event) => setProductId(event.target.value)} value={productId}>
              <option value="all">Todos</option>
              {active.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
          </label>
          <label>
            Estado
            <select onChange={(event) => setStatus(event.target.value as TransactionStatus | 'all')} value={status}>
              <option value="all">Todos</option>
              <option value="completed">Registrado</option>
              <option value="pending">Pendiente</option>
              <option value="scheduled">Programado</option>
            </select>
          </label>
          <label>Monto mínimo<input inputMode="decimal" onChange={(event) => setMinAmount(event.target.value)} placeholder="0" value={minAmount} /></label>
        </div>
        <div className="mini-summary">
          <span>Ingresos: {formatMoney(totals.income, currency, data.settings.privacyMode)}</span>
          <span>Gastos: {formatMoney(totals.expenses, currency, data.settings.privacyMode)}</span>
          <span>Balance: {formatMoney(totals.balance, currency, data.settings.privacyMode)}</span>
        </div>

        <table className="finance-table">
          <thead>
            <tr>
              <th className="left-cell">Fecha</th>
              <th className="left-cell">Descripción</th>
              <th className="left-cell">Categoría</th>
              <th className="center-cell">Tipo</th>
              <th className="center-cell">Método</th>
              <th className="left-cell">Producto</th>
              <th className="amount-cell">Monto</th>
              <th className="center-cell">Estado</th>
              <th className="center-cell">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td className="left-cell">{humanDate(item.date)}</td>
                <td className="left-cell"><strong>{item.description}</strong></td>
                <td className="left-cell">{item.category}</td>
                <td className="center-cell"><span className={`type-pill ${item.kind}`}>{item.kind === 'income' ? 'Ingreso' : 'Gasto'}</span></td>
                <td className="center-cell">{item.method}</td>
                <td className="left-cell">{productName(item.linkedProductId)}</td>
                <td className={`amount-cell ${item.kind}`}>{item.kind === 'income' ? '+' : '-'}{formatMoney(item.amount, currency, data.settings.privacyMode)}</td>
                <td className="center-cell"><span className={`status-pill ${item.status || 'completed'}`}>{item.status === 'pending' ? 'Pendiente' : item.status === 'scheduled' ? 'Programado' : 'Registrado'}</span></td>
                <td className="center-cell">
                  <button className="icon-button" onClick={() => deleteTransaction(item.id)} type="button"><Trash2 size={17} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="movement-card-list">
          {filtered.map((item) => (
            <article className="movement-card" key={item.id}>
              <div>
                <strong>{item.description}</strong>
                <b className={item.kind}>{item.kind === 'income' ? '+' : '-'}{formatMoney(item.amount, currency, data.settings.privacyMode)}</b>
              </div>
              <span>{humanDate(item.date)} · {item.category}</span>
              <p>{item.kind === 'income' ? 'Ingreso' : 'Gasto'} · {item.method} · {productName(item.linkedProductId)}</p>
              <span className={`status-pill ${item.status || 'completed'}`}>{item.status === 'pending' ? 'Pendiente' : item.status === 'scheduled' ? 'Programado' : 'Registrado'}</span>
              <button className="icon-button" onClick={() => deleteTransaction(item.id)} type="button"><Trash2 size={17} /></button>
            </article>
          ))}
        </div>
      </section>
      <aside>
        <h3>Registro rápido</h3>
        <TransactionForm mode={active.mode} onSave={addTransaction} />
      </aside>
    </div>
  );
};
