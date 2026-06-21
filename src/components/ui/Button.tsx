import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';

const classes: Record<ButtonVariant, string> = {
  primary: 'primary-btn',
  secondary: 'secondary-btn',
  ghost: 'ghost-btn',
  danger: 'danger-btn',
  icon: 'icon-button'
};

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: ButtonVariant }) => (
  <button className={`${classes[variant]} ${className}`.trim()} type="button" {...props}>
    {children}
  </button>
);
