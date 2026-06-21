import { formatMoney, formatPercent } from '../../utils/formatters';

export const SpendingBreakdown = ({
  categories,
  total,
  currency,
  privacyMode
}: {
  categories: { name: string; value: number }[];
  total: number;
  currency: string;
  privacyMode: boolean;
}) => (
  <article className="panel spending-panel">
    <div className="section-title">
      <h3>Dónde se fue tu dinero</h3>
    </div>
    <div className="spending-list">
      {categories.length ? (
        categories.slice(0, 5).map((item, index) => {
          const percent = total ? (item.value / total) * 100 : 0;
          return (
            <div className="spending-item" key={item.name}>
              <span className="rank">{index + 1}</span>
              <div>
                <strong>{item.name}</strong>
                <div className="spending-bar"><i style={{ width: `${percent}%` }} /></div>
              </div>
              <b>{formatMoney(item.value, currency, privacyMode)}</b>
              <em>{formatPercent(percent)}</em>
            </div>
          );
        })
      ) : (
        <p className="muted">Agrega gastos para ver tus categorías principales.</p>
      )}
    </div>
  </article>
);
