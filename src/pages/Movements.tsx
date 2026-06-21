import { Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { TransactionForm } from '../components/forms/TransactionForm';
import { useFinance } from '../store/financeStore';
import { activeData, totalsForPeriod } from '../utils/calculations';
import { currentMonthPeriod, humanDate } from '../utils/dates';
import { formatMoney } from '../utils/formatters';

export const Movements = () => {
  const { data, addTransaction, deleteTransaction } = useFinance();
  const [query, setQuery] = useState('');
  if (!data) return null;
  const active = activeData(data);
  const currency = data.settings.currency;
  const productName = (id?: string) => active.products.find((product) => product.id === id)?.name || 'Sin producto';
  const filtered = active.transactions.filter((item) =>
    `${item.description} ${item.category} ${item.note || ''}`.toLowerCase().includes(query.toLowerCase())
  );
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
