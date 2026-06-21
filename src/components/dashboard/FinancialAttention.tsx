import { AlertList } from '../alerts/AlertList';
import type { FinanceAlert } from '../../types/finance';

const priority = {
  critical: 0,
  warning: 1,
  info: 2,
  success: 3
};

export const FinancialAttention = ({ alerts }: { alerts: FinanceAlert[] }) => {
  const visible = [...alerts].sort((a, b) => priority[a.level] - priority[b.level]).slice(0, 4);
  return (
    <article className="panel attention-panel">
      <div className="section-title">
        <h3>Atención financiera</h3>
        <span>{visible.length}</span>
      </div>
      {visible.length ? (
        <AlertList alerts={visible} />
      ) : (
        <p className="muted">Sin alertas importantes por ahora. Buen momento para revisar tus metas.</p>
      )}
    </article>
  );
};
