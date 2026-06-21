import type { BankProduct } from '../../types/finance';
import { humanDate } from '../../utils/dates';
import { formatMoney, formatPercent } from '../../utils/formatters';

type Usage = {
  card: BankProduct;
  consumed: number;
  available: number;
  usage: number;
  dueDate: string;
  cutDate: string;
};

export const CreditCardSummary = ({
  cards,
  currency,
  privacyMode
}: {
  cards: Usage[];
  currency: string;
  privacyMode: boolean;
}) => {
  const totalConsumed = cards.reduce((total, item) => total + item.consumed, 0);
  const totalAvailable = cards.reduce((total, item) => total + item.available, 0);
  const topCard = [...cards].sort((a, b) => b.usage - a.usage)[0];

  return (
    <article className="panel card-summary-panel">
      <div className="section-title">
        <h3>Tarjetas</h3>
        {topCard?.usage >= 80 && <span className="status-chip warning">Uso alto</span>}
      </div>
      {cards.length ? (
        <>
          <div className="summary-lines">
            <span>Consumo actual <b>{formatMoney(totalConsumed, currency, privacyMode)}</b></span>
            <span>Disponible estimado <b>{formatMoney(totalAvailable, currency, privacyMode)}</b></span>
            <span>Mayor uso <b>{topCard.card.name}, {formatPercent(topCard.usage)}</b></span>
            <span>Próximo corte <b>{humanDate(topCard.cutDate)}</b></span>
          </div>
          <div className="progress-row card-usage-row">
            <span>{topCard.card.name}</span>
            <strong>{formatPercent(topCard.usage)}</strong>
            <div><i style={{ width: `${Math.min(topCard.usage, 100)}%` }} /></div>
          </div>
        </>
      ) : (
        <p className="muted">Agrega una tarjeta para ver consumo, corte y fecha límite.</p>
      )}
    </article>
  );
};
