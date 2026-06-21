import { Trash2 } from 'lucide-react';

import { CardConsumptionForm } from '../components/forms/CardConsumptionForm';
import { ProductForm } from '../components/forms/ProductForm';
import { useFinance } from '../store/financeStore';
import { activeData, cardUsage, creditCards, loanInstallments, loans } from '../utils/calculations';
import { humanDate } from '../utils/dates';
import { formatMoney, formatPercent } from '../utils/formatters';

const productLabels: Record<string, string> = {
  'credit-card': 'Tarjeta',
  loan: 'Préstamo',
  'bank-account': 'Cuenta',
  'informal-debt': 'Deuda informal',
  financing: 'Financiamiento',
  'recurring-service': 'Servicio recurrente',
  savings: 'Ahorro',
  investment: 'Inversión',
  other: 'Otro'
};

const statusLabels: Record<string, string> = {
  current: 'Al día',
  'due-soon': 'Próximo',
  overdue: 'Vencido',
  delinquent: 'En mora',
  paid: 'Pagado'
};

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
          {active.products.map((product) => {
            const usage = product.type === 'credit-card' ? cardUsage([product], active.cardConsumptions)[0] : null;
            const installments = ['loan', 'financing'].includes(product.type) ? loanInstallments(product) : null;
            const progress =
              product.type === 'credit-card' && product.creditLimit
                ? ((product.balance || usage?.consumed || 0) / product.creditLimit) * 100
                : product.originalAmount
                  ? ((product.originalAmount - product.balance) / product.originalAmount) * 100
                  : 0;
            return (
              <article className={`bank-card ${product.type}`} key={product.id} style={{ borderColor: product.color }}>
                <div className="card-heading-row">
                  <div>
                    <span>{productLabels[product.type] || 'Producto'}</span>
                    <h3>{product.name}</h3>
                    <p>{product.bank}</p>
                  </div>
                  <span className={`status-pill ${product.status || 'current'}`}>{statusLabels[product.status || 'current']}</span>
                </div>
                <strong>{formatMoney(product.balance, currency, data.settings.privacyMode)}</strong>
                <div className="progress-row">
                  <div><i style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} /></div>
                </div>
                {usage && (
                  <div className="product-detail-grid">
                    <span>Límite <b>{formatMoney(product.creditLimit || 0, currency, data.settings.privacyMode)}</b></span>
                    <span>Disponible <b>{formatMoney(usage.available, currency, data.settings.privacyMode)}</b></span>
                    <span>Corte <b>{humanDate(usage.cutDate)}</b></span>
                    <span>Pago límite <b>{humanDate(usage.dueDate)}</b></span>
                    <span>Pago mínimo <b>{formatMoney(product.minimumPayment || 0, currency, data.settings.privacyMode)}</b></span>
                    <span>Uso <b>{formatPercent(usage.usage)}</b></span>
                  </div>
                )}
                {installments && (
                  <div className="product-detail-grid">
                    <span>Cuota <b>{formatMoney(product.monthlyPayment || 0, currency, data.settings.privacyMode)}</b></span>
                    <span>Cuotas <b>{installments.paid}/{installments.total}</b></span>
                    <span>Restantes <b>{installments.remaining}</b></span>
                    <span>Próximo pago <b>{product.nextPaymentDate ? humanDate(product.nextPaymentDate) : 'Pendiente'}</b></span>
                  </div>
                )}
                {product.notes && <p className="product-note">{product.notes}</p>}
                <div className="card-actions">
                  <button className="secondary-btn" type="button">Registrar pago</button>
                  <button className="ghost-btn" type="button">Ver detalle</button>
                  <button className="icon-button" onClick={() => deleteProduct(product.id)} type="button" aria-label="Eliminar producto"><Trash2 size={17} /></button>
                </div>
              </article>
            );
          })}
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
        <ProductForm currency={currency} mode={active.mode} onSave={addProduct} />
        <h3>Consumo de tarjeta</h3>
        <CardConsumptionForm cards={cards} mode={active.mode} onSave={addCardConsumption} />
      </aside>
    </div>
  );
};
