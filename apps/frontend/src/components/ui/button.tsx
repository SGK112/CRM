import React from 'react';
import clsx from 'clsx';

export type ButtonIntent = 'primary' | 'secondary' | 'neutral' | 'danger' | 'warning' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const intentToClass: Record<ButtonIntent, string> = {
  primary: 'pill-tint-blue',
  secondary: 'pill-tint-indigo',
  neutral: 'pill-tint-neutral',
  danger: 'pill-tint-red',
  warning: 'pill-tint-yellow',
  success: 'pill-tint-green',
};

const sizeToClass: Record<ButtonSize, string> = {
  xs: 'pill xs',
  sm: 'pill sm',
  md: 'pill',
  lg: 'pill lg',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: ButtonIntent;
  size?: ButtonSize;
  full?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  intent = 'primary',
  size = 'md',
  className,
  full,
  iconLeft,
  iconRight,
  children,
  disabled,
  loading,
  ...rest
}) => {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center gap-1 font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:opacity-50 disabled:cursor-not-allowed',
        sizeToClass[size],
        intentToClass[intent],
        full && 'w-full justify-center',
        className
      )}
    >
      {loading && (
        <span
          className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden
        />
      )}
      {iconLeft && <span className="shrink-0">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};

export default Button;
