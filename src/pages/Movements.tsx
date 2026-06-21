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
  const filtered = active.transactions.filter((item) =>
    `${item.description} ${item.category} ${item.note || ''}`.toLowerCase().includes(query.toLowerCase())
  );
  const totals = useMemo(() => totalsForPeriod(filtered, currentMonthPeriod()), [filtered]);

  return (
    <div className="two-column">
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
        <div className="list-stack">
          {filtered.map((item) => (
            <article className="row-item" key={item.id}>
              <div>
                <strong>{item.description}</strong>
                <span>{humanDate(item.date)} · {item.category} · {item.expenseType || item.method}</span>
              </div>
              <b className={item.kind}>{item.kind === 'income' ? '+' : '-'}{formatMoney(item.amount, currency, data.settings.privacyMode)}</b>
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
