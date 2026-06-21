import { Trash2 } from 'lucide-react';

import { CardConsumptionForm } from '../components/forms/CardConsumptionForm';
import { ProductForm } from '../components/forms/ProductForm';
import { useFinance } from '../store/financeStore';
import { activeData, cardUsage, creditCards, loans } from '../utils/calculations';
import { formatMoney, formatPercent } from '../utils/formatters';

export const Banking = () => {
  const { data, addProduct, deleteProduct, addCardConsumption, deleteCardConsumption } = useFinance();
  if (!data) return null;
  const active = activeData(data);
  const cards = creditCards(active.products);
  const currency = data.settings.currency;

  return (
    <div className="two-column">
      <section>
        <div className="section-title">
          <h2>Bancos y productos</h2>
          <span>{active.products.length}</span>
        </div>
        <div className="card-grid">
          {active.products.map((product) => (
            <article className="bank-card" key={product.id} style={{ borderColor: product.color }}>
              <span>{product.type === 'credit-card' ? 'Tarjeta' : product.type === 'loan' ? 'Préstamo' : 'Cuenta'}</span>
              <h3>{product.name}</h3>
              <p>{product.bank}</p>
              <strong>{formatMoney(product.balance, currency, data.settings.privacyMode)}</strong>
              <button className="icon-button" onClick={() => deleteProduct(product.id)} type="button"><Trash2 size={17} /></button>
            </article>
          ))}
        </div>

        <div className="content-grid compact">
          <article className="panel">
            <h3>Uso de tarjetas</h3>
            {cardUsage(active.products, active.cardConsumptions).map((item) => (
              <div className="progress-row" key={item.card.id}>
                <span>{item.card.name}</span>
                <strong>{formatPercent(item.usage)}</strong>
                <div><i style={{ width: `${Math.min(item.usage, 100)}%` }} /></div>
              </div>
            ))}
          </article>
          <article className="panel">
            <h3>Préstamos</h3>
            {loans(active.products).map((loan) => (
              <div className="row-item" key={loan.id}>
                <div>
                  <strong>{loan.name}</strong>
                  <span>Cuota mensual</span>
                </div>
                <b>{formatMoney(loan.monthlyPayment || 0, currency, data.settings.privacyMode)}</b>
              </div>
            ))}
          </article>
        </div>

        <article className="panel">
          <h3>Consumos de tarjetas</h3>
          <div className="list-stack">
            {active.cardConsumptions.map((item) => (
              <div className="row-item" key={item.id}>
                <div>
                  <strong>{item.merchant}</strong>
                  <span>{cards.find((card) => card.id === item.cardId)?.name || 'Tarjeta'} · {item.category}</span>
                </div>
                <b>{formatMoney(item.amount, currency, data.settings.privacyMode)}</b>
                <button className="icon-button" onClick={() => deleteCardConsumption(item.id)} type="button"><Trash2 size={17} /></button>
              </div>
            ))}
          </div>
        </article>
      </section>
      <aside>
        <h3>Nuevo producto</h3>
        <ProductForm mode={active.mode} onSave={addProduct} />
        <h3>Consumo de tarjeta</h3>
        <CardConsumptionForm cards={cards} mode={active.mode} onSave={addCardConsumption} />
      </aside>
    </div>
  );
};
