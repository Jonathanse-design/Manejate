import { Trash2 } from 'lucide-react';

import { CardConsumptionForm } from '../components/forms/CardConsumptionForm';
import { ProductForm } from '../components/forms/ProductForm';
import { useFinance } from '../store/financeStore';
import { activeData, cardUsage, creditCards, loans, loanProgress, productPaymentStatus } from '../utils/calculations';
import { daysUntil, humanDate } from '../utils/dates';
import { formatMoney, formatPercent } from '../utils/formatters';

const statusLabel = {
  current: 'Al día',
  upcoming: 'Próximo',
  due_today: 'Vence hoy',
  overdue: 'Vencido'
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
            const isCard = product.type === 'credit-card';
            const isLoan = product.type === 'loan';
            const usage = isCard ? cardUsage([product], active.cardConsumptions)[0] : null;
            const loan = isLoan ? loanProgress(product) : null;
            const dueDate = isCard
              ? product.paymentDueDate || usage?.dueDate
              : product.nextPaymentDate;
            const status = productPaymentStatus(dueDate);
            return (
              <article className={`bank-card product-card ${product.type}`} key={product.id} style={{ borderColor: product.color }}>
                <div className="product-card-head">
                  <div>
                    <span>{isCard ? 'Tarjeta de crédito' : isLoan ? 'Préstamo' : product.accountType || 'Cuenta bancaria'}</span>
                    <h3>{product.name}{product.last4 ? ` • ${product.last4}` : ''}</h3>
                    <p>{product.bank || product.bankName || 'Entidad financiera'}</p>
                  </div>
                  <em className={`status-chip ${status}`}>{statusLabel[status]}</em>
                </div>

                {isCard && usage && (
                  <>
                    <div className="product-metrics">
                      <span>Balance actual <b>{formatMoney(product.currentBalance ?? product.balance, currency, data.settings.privacyMode)}</b></span>
                      <span>Límite <b>{formatMoney(product.creditLimit || 0, currency, data.settings.privacyMode)}</b></span>
                      <span>Disponible <b>{formatMoney(usage.available, currency, data.settings.privacyMode)}</b></span>
                      <span>Pago mínimo <b>{formatMoney(product.minimumPayment || 0, currency, data.settings.privacyMode)}</b></span>
                    </div>
                    <div className="progress-row">
                      <span>Uso del límite</span>
                      <strong>{formatPercent(usage.usage)}</strong>
                      <div><i style={{ width: `${Math.min(usage.usage, 100)}%` }} /></div>
                    </div>
                    <div className="product-dates">
                      <span>Corte <b>{humanDate(usage.cutDate)}</b><small>{daysUntil(usage.cutDate)} días</small></span>
                      <span>Fecha límite <b>{humanDate(usage.dueDate)}</b><small>{daysUntil(usage.dueDate)} días</small></span>
                    </div>
                  </>
                )}

                {isLoan && loan && (
                  <>
                    <div className="product-metrics">
                      <span>Balance pendiente <b>{formatMoney(product.remainingBalance ?? product.balance, currency, data.settings.privacyMode)}</b></span>
                      <span>Cuota mensual <b>{formatMoney(product.monthlyPayment || 0, currency, data.settings.privacyMode)}</b></span>
                      <span>Cuotas <b>{loan.paidInstallments}/{loan.totalInstallments}</b></span>
                      <span>Restantes <b>{loan.remainingInstallments}</b></span>
                    </div>
                    <div className="progress-row">
                      <span>Progreso del préstamo</span>
                      <strong>{formatPercent(loan.progress)}</strong>
                      <div><i style={{ width: `${Math.min(loan.progress, 100)}%` }} /></div>
                    </div>
                    <div className="product-dates">
                      <span>Próximo pago <b>{product.nextPaymentDate ? humanDate(product.nextPaymentDate) : 'Sin fecha'}</b></span>
                    </div>
                  </>
                )}

                {!isCard && !isLoan && (
                  <div className="product-metrics">
                    <span>Balance actual <b>{formatMoney(product.balance, currency, data.settings.privacyMode)}</b></span>
                    <span>Moneda <b>{product.currency}</b></span>
                  </div>
                )}
                <button aria-label="Eliminar producto" className="icon-button" onClick={() => deleteProduct(product.id)} type="button"><Trash2 size={17} /></button>
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
        <h3>Agregar producto financiero</h3>
        <ProductForm currency={currency} mode={active.mode} onSave={addProduct} />
        <h3>Consumo de tarjeta</h3>
        <CardConsumptionForm cards={cards} mode={active.mode} onSave={addCardConsumption} />
      </aside>
    </div>
  );
};
