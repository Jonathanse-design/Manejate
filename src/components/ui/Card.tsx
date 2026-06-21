import type { HTMLAttributes, ReactNode } from 'react';

export const Card = ({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) => (
  <article className={`panel ${className}`.trim()} {...props}>
    {children}
  </article>
);
