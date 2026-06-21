import type { ReactNode } from 'react';

export const Badge = ({
  children,
  tone = 'neutral'
}: {
  children: ReactNode;
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}) => <span className={`status-pill ${tone}`}>{children}</span>;
