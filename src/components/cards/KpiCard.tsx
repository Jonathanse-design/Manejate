import type { ReactNode } from 'react';

type KpiCardProps = {
  label: string;
  value: string;
  tone?: 'green' | 'red' | 'blue' | 'amber' | 'violet' | 'neutral';
  helper?: string;
  icon?: ReactNode;
};

export const KpiCard = ({ label, value, tone = 'neutral', helper, icon }: KpiCardProps) => (
  <article className={`kpi-card tone-${tone}`}>
    <div className="kpi-top">
      <span>{label}</span>
      {icon && <div className="icon-chip">{icon}</div>}
    </div>
    <strong>{value}</strong>
    {helper && <small>{helper}</small>}
  </article>
);
