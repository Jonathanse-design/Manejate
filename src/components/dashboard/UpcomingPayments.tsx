import { differenceInCalendarDays, parseISO } from 'date-fns';

import type { BankProduct } from '../../types/finance';
import { humanDate, today } from '../../utils/dates';
import { formatMoney } from '../../utils/formatters';

type Payment = {
  id: string;
  title: string;
  type: string;
  amount: number;
  date: string;
};

const paymentStatus = (date: string) => {
  const days = differenceInCalendarDays(parseISO(date), today());
  if (days < 0) return { label: 'Vencido', className: 'critical', detail: `${Math.abs(days)} días tarde` };
  if (days === 0) return { label: 'Hoy', className: 'warning', detail: 'Vence hoy' };
  return { label: 'Próximo', className: days <= 3 ? 'warning' : 'info', detail: `Faltan ${days} días` };
};

export const UpcomingPayments = ({
  payments,
  products,
  currency,
  privacyMode
}: {
  payments: Payment[];
  products: BankProduct[];
  currency: string;
  privacyMode: boolean;
}) => (
  <article className="panel payments-panel">
    <div className="section-title">
      <h3>Próximos pagos</h3>
    </div>
    <div className="payment-list">
      {payments.length ? (
        payments.slice(0, 4).map((payment) => {
          const product = products.find((item) => item.id === payment.id);
          const status = paymentStatus(payment.date);
          return (
            <div className="payment-card" key={`${payment.id}-${payment.date}`}>
              <div>
                <span>{payment.type}</span>
                <strong>{payment.title}</strong>
                <p>{product?.bank || 'Producto financiero'}</p>
              </div>
              <div>
                <b>{formatMoney(payment.amount, currency, privacyMode)}</b>
                <small>Vence: {humanDate(payment.date)}</small>
                <em className={`status-chip ${status.className}`}>{status.detail}</em>
              </div>
            </div>
          );
        })
      ) : (
        <p className="muted">No hay pagos próximos registrados.</p>
      )}
    </div>
  </article>
);
