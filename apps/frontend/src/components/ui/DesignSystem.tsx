import React from 'react';
import clsx from 'clsx';

// Core tokens consumed from CSS variables (globals.css)
// Shared size scales
const sizes = {
  sm: 'text-xs h-7 px-3',
  md: 'text-sm h-9 px-4',
  lg: 'text-base h-11 px-5'
};

const radii = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  full: 'rounded-full'
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'pill';
  tone?: 'default' | 'accent' | 'danger' | 'warn' | 'success' | 'neutral';
  size?: keyof typeof sizes;
  radius?: keyof typeof radii;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const toneMap: Record<string, { base: string; focus: string; hover: string; border?: string; text?: string; } > = {
  default: { base: 'bg-[var(--surface-2)] text-[var(--text)]', hover: 'hover:bg-[var(--surface-3)]', focus: 'focus:ring-[var(--accent)] focus:ring-2', border: 'border border-[var(--border)]' },
  accent: { base: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white', hover: 'hover:from-purple-700 hover:to-blue-700', focus: 'focus:ring-2 focus:ring-purple-500' },
  danger: { base: 'bg-red-600 text-white', hover: 'hover:bg-red-700', focus: 'focus:ring-2 focus:ring-red-500' },
  warn: { base: 'bg-yellow-500 text-black', hover: 'hover:bg-yellow-600', focus: 'focus:ring-2 focus:ring-yellow-400' },
  success: { base: 'bg-green-600 text-white', hover: 'hover:bg-green-700', focus: 'focus:ring-2 focus:ring-green-500' },
  neutral: { base: 'bg-[var(--surface-2)] text-[var(--text-dim)]', hover: 'hover:bg-[var(--surface-3)]', focus: 'focus:ring-[var(--accent)] focus:ring-2', border: 'border border-[var(--border)]' }
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'solid',
  tone = 'default',
  size = 'md',
  radius = 'md',
  loading,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...rest
}) => {
  const t = toneMap[tone];
  const base = sizes[size];
  const rad = radii[radius];
  const variantClasses = {
    solid: `${t.base} ${t.hover} ${t.focus} ${t.border || ''}`.trim(),
    outline: `bg-transparent ${t.text || 'text-[var(--text)]'} border border-[var(--border)] hover:bg-[var(--surface-2)] ${t.focus}`,
    ghost: 'bg-transparent hover:bg-[var(--surface-2)] text-[var(--text-dim)] focus:ring-2 focus:ring-[var(--accent)]',
    pill: 'pill'
  }[variant];

  return (
    <button
      className={clsx('inline-flex items-center font-medium transition relative select-none', base, rad, variantClasses, disabled && 'opacity-60 cursor-not-allowed', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="absolute left-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {leftIcon && <span className={clsx('mr-2 flex items-center', loading && 'opacity-30')}>{leftIcon}</span>}
      <span className={loading ? 'opacity-30' : undefined}>{children}</span>
      {rightIcon && <span className={clsx('ml-2 flex items-center', loading && 'opacity-30')}>{rightIcon}</span>}
    </button>
  );
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  surface?: 1 | 2 | 3;
  interactive?: boolean;
}

const padMap = { none: 'p-0', sm: 'p-3', md: 'p-5', lg: 'p-7' };
export const Card: React.FC<CardProps> = ({ padding='md', surface=1, interactive, className, children, ...rest }) => {
  return (
    <div
      className={clsx('rounded-lg border shadow-sm', `surface-${surface}`, 'border-token', padMap[padding], interactive && 'transition hover:shadow-md hover:border-[var(--accent)]/40', className)}
      {...rest}
    >
      {children}
    </div>
  )
};

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tint?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Pill: React.FC<PillProps> = ({ tint='neutral', size='md', active, iconLeft, iconRight, className, children, ...rest }) => {
  return (
    <span
      data-active={active ? 'true':'false'}
      className={clsx('pill', `pill-tint-${tint}`, size==='sm' && 'sm', size==='lg' && 'lg', className)}
      {...rest}
    >
      {iconLeft && <span className="-ml-0.5 mr-0.5 flex items-center">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-0.5 -mr-0.5 flex items-center">{iconRight}</span>}
    </span>
  );
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> { tone?: 'accent' | 'danger' | 'warn' | 'success' | 'neutral'; }
export const Badge: React.FC<BadgeProps> = ({ tone='neutral', className, children, ...rest }) => {
  const map: Record<string,string> = {
    accent: 'pill-tint-blue', danger: 'pill-tint-red', warn: 'pill-tint-yellow', success: 'pill-tint-green', neutral: 'pill-tint-neutral'
  };
  return <span className={clsx('pill sm', map[tone], className)} {...rest}>{children}</span>;
};

export const Stack: React.FC<{ gap?: number; className?: string; direction?: 'row' | 'col'; wrap?: boolean; children: React.ReactNode; }>
= ({ gap=4, className, direction='row', wrap, children }) => (
  <div className={clsx('flex', direction==='col' && 'flex-col', wrap && 'flex-wrap', `gap-${gap}`, className)}>{children}</div>
);

export const Divider: React.FC<{ vertical?: boolean; className?: string; }>
= ({ vertical, className }) => <div className={clsx(vertical ? 'w-px h-full' : 'h-px w-full', 'bg-[var(--border)]', className)} />;

// Typography wrappers
export const Heading: React.FC<{ level?: 1|2|3|4|5|6; className?: string; children: React.ReactNode; }>
= ({ level=2, className, children }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const sizes: Record<number,string> = {1:'text-3xl',2:'text-2xl',3:'text-xl',4:'text-lg',5:'text-base',6:'text-sm'};
  return <Tag className={clsx('font-semibold tracking-tight text-[var(--text)]', sizes[level], className)}>{children}</Tag>;
};

// Export a single namespace object if desired
export const DS = { Button, Card, Pill, Badge, Stack, Divider, Heading };
