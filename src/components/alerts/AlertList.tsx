import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

import type { FinanceAlert } from '../../types/finance';

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
  success: CheckCircle2
};

export const AlertList = ({ alerts, limit }: { alerts: FinanceAlert[]; limit?: number }) => {
  const visible = limit ? alerts.slice(0, limit) : alerts;
  return (
    <div className="alert-list">
      {visible.map((alert) => {
        const Icon = iconMap[alert.level];
        return (
          <article className={`alert-item ${alert.level}`} key={alert.id}>
            <Icon size={18} />
            <div>
              <strong>{alert.title}</strong>
              <p>{alert.message}</p>
              <span>{alert.action}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
};
